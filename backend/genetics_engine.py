from itertools import product
from typing import Dict, List, Any


# config is passed dynamically to functions
SPECIES_CONFIG = {}


def canonicalize_genotype(genotype: str) -> str:
    genotype = genotype.strip()
    if len(genotype) != 2:
        raise ValueError(f"基因型格式錯誤：{genotype}")
    return "".join(sorted([genotype[0], genotype[1]], key=lambda allele: (allele.islower(), allele)))


def get_gametes(genotype: str) -> List[str]:
    genotype = canonicalize_genotype(genotype)
    return [genotype[0], genotype[1]]


def cross_genotypes(first_parent_genotype: str, second_parent_genotype: str) -> Dict[str, float]:
    first_parent_gametes = get_gametes(first_parent_genotype)
    second_parent_gametes = get_gametes(second_parent_genotype)

    offspring_counter: Dict[str, int] = {}

    for first_gamete in first_parent_gametes:
        for second_gamete in second_parent_gametes:
            offspring_genotype = canonicalize_genotype(first_gamete + second_gamete)
            offspring_counter[offspring_genotype] = offspring_counter.get(offspring_genotype, 0) + 1

    total_count = sum(offspring_counter.values())
    return {
        genotype: count / total_count
        for genotype, count in offspring_counter.items()
    }


def relabel_distribution(distribution: Dict[str, float], labels: Dict[str, str]) -> Dict[str, float]:
    return {
        labels.get(key, key): value
        for key, value in distribution.items()
        if value > 0
    }


def resolve_dominant(first_parent_genotype: str, second_parent_genotype: str) -> Dict[str, float]:
    genotype_distribution = cross_genotypes(first_parent_genotype, second_parent_genotype)
    result = {
        "expressed": 0.0,
        "not_expressed": 0.0
    }

    for genotype, probability in genotype_distribution.items():
        if genotype in ("AA", "Aa"):
            result["expressed"] += probability
        elif genotype == "aa":
            result["not_expressed"] += probability

    return result


def resolve_recessive(first_parent_genotype: str, second_parent_genotype: str) -> Dict[str, float]:
    genotype_distribution = cross_genotypes(first_parent_genotype, second_parent_genotype)
    result = {
        "expressed": 0.0,
        "carrier": 0.0,
        "not_expressed": 0.0
    }

    for genotype, probability in genotype_distribution.items():
        if genotype == "aa":
            result["expressed"] += probability
        elif genotype == "Aa":
            result["carrier"] += probability
        elif genotype == "AA":
            result["not_expressed"] += probability

    return result


def resolve_compound(first_parent_genotype: str, second_parent_genotype: str) -> Dict[str, float]:
    genotype_distribution = cross_genotypes(first_parent_genotype, second_parent_genotype)
    result = {
        "major": 0.0,
        "middle": 0.0,
        "minor": 0.0
    }

    for genotype, probability in genotype_distribution.items():
        if genotype == "AA":
            result["major"] += probability
        elif genotype == "Aa":
            result["middle"] += probability
        elif genotype == "aa":
            result["minor"] += probability

    return result


def build_pair_key(first_parent_value: str, second_parent_value: str) -> str:
    return "|".join(sorted([first_parent_value, second_parent_value]))


def resolve_special(
    special_rule_key: str,
    first_parent_value: str,
    second_parent_value: str,
    special_rules: Dict[str, Dict[str, Dict[str, float]]]
) -> Dict[str, float]:
    if special_rule_key not in special_rules:
        raise KeyError(f"找不到特殊規則：{special_rule_key}")

    pair_key = build_pair_key(first_parent_value, second_parent_value)
    rule_map = special_rules[special_rule_key]

    if pair_key not in rule_map:
        raise KeyError(f"特殊規則不存在：{special_rule_key} / {pair_key}")

    return dict(rule_map[pair_key])


def resolve_gene(
    config: Dict[str, Any],
    species_name: str,
    gene_name: str,
    first_parent_value: str,
    second_parent_value: str
) -> Dict[str, float]:
    actual_species = species_name or config.get("defaultSpecies", "cat")

    if actual_species not in config["species"]:
        raise KeyError(f"找不到物種：{actual_species}")

    species_config = config["species"][actual_species]

    if gene_name not in species_config["genes"]:
        raise KeyError(f"物種 {actual_species} 找不到基因：{gene_name}")

    gene_config = species_config["genes"][gene_name]
    category = gene_config["category"]

    if category == "dominant":
        return relabel_distribution(
            resolve_dominant(first_parent_value, second_parent_value),
            gene_config.get("labels", {})
        )

    if category == "recessive":
        return relabel_distribution(
            resolve_recessive(first_parent_value, second_parent_value),
            gene_config.get("labels", {})
        )

    if category == "compound":
        return relabel_distribution(
            resolve_compound(first_parent_value, second_parent_value),
            gene_config.get("labels", {})
        )

    if category == "special":
        return resolve_special(
            gene_config["specialRuleKey"],
            first_parent_value,
            second_parent_value,
            config.get("specialRules", {})
        )

    raise ValueError(f"不支援的基因分類：{category}")


def resolve_multiple_genes(
    config: Dict[str, Any],
    species_name: str,
    gene_inputs: Dict[str, Dict[str, str]]
) -> Dict[str, Dict[str, float]]:
    result: Dict[str, Dict[str, float]] = {}

    for gene_name, parent_values in gene_inputs.items():
        result[gene_name] = resolve_gene(
            config=config,
            species_name=species_name,
            gene_name=gene_name,
            first_parent_value=parent_values["parent1"],
            second_parent_value=parent_values["parent2"]
        )

    return result


def expand_all_combinations(
    gene_distribution_map: Dict[str, Dict[str, float]]
) -> List[Dict[str, Any]]:
    gene_names = list(gene_distribution_map.keys())

    per_gene_items: List[List[Any]] = []
    for gene_name in gene_names:
        trait_items = list(gene_distribution_map[gene_name].items())
        per_gene_items.append(trait_items)

    combination_result_list: List[Dict[str, Any]] = []

    for combination in product(*per_gene_items):
        combined_probability = 1.0
        combined_traits: Dict[str, str] = {}
        combined_trait_list: List[str] = []

        for gene_name, (trait_name, probability_value) in zip(gene_names, combination):
            combined_probability *= probability_value
            combined_traits[gene_name] = trait_name
            combined_trait_list.append(trait_name)

        combination_result_list.append({
            "genes": combined_traits,
            "labels": combined_trait_list,
            "probability": combined_probability
        })

    combination_result_list.sort(key=lambda item: item["probability"], reverse=True)
    return combination_result_list


def format_single_distribution(distribution: Dict[str, float], decimal_places: int = 2) -> str:
    text_list = []
    for trait_name, probability in distribution.items():
        if probability <= 0:
            continue
        text_list.append(f"{probability * 100:.{decimal_places}f}% {trait_name}")
    return "，".join(text_list)


def format_combination_result(combination_result_list: List[Dict[str, Any]], decimal_places: int = 4) -> List[str]:
    result_lines = []

    for index, item in enumerate(combination_result_list, start=1):
        if item['probability'] == 0:
            continue
        trait_text = " + ".join(item["labels"])
        probability_text = f"{item['probability'] * 100:.{decimal_places}f}%"
        result_lines.append({
            "traits": item["labels"],
            "probability": item["probability"]
        })

    return result_lines
