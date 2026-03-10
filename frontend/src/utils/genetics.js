import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getDefaultAllele = (geneDef, currentConfig) => {
  if (geneDef.inputType === 'genotype') {
    if (geneDef.category === 'dominant') return 'aa';
    if (geneDef.category === 'recessive') return 'AA';
    if (geneDef.category === 'compound') return 'aa';
    return 'Aa';
  } else if (geneDef.inputType === 'option' && geneDef.specialRuleKey && currentConfig) {
    const ruleMap = currentConfig.specialRules[geneDef.specialRuleKey];
    if (ruleMap) {
      const firstKeyPairs = Object.keys(ruleMap)[0].split('|');
      return firstKeyPairs[0] || 'unknown';
    }
  }
  return 'Aa';
};

export const getOptionsForGene = (geneDef, config) => {
  if (geneDef.inputType === 'genotype') {
    const labels = geneDef.labels || {};
    let labelAA = "AA";
    let labelAa = "Aa";
    let labelaa = "aa";

    if (geneDef.category === "dominant") {
      labelAA = labels.expressed ? `${labels.expressed} (AA)` : "顯性表現 (AA)";
      labelAa = labels.expressed ? `${labels.expressed}帶因 (Aa)` : "顯性帶因 (Aa)";
      labelaa = labels.not_expressed ? `${labels.not_expressed} (aa)` : "未表現 (aa)";
    } else if (geneDef.category === "recessive") {
      labelAA = labels.not_expressed ? `${labels.not_expressed} (AA)` : "未表現 (AA)";
      labelAa = labels.carrier ? `${labels.carrier} (Aa)` : "帶因 (Aa)";
      labelaa = labels.expressed ? `${labels.expressed} (aa)` : "隱性表現 (aa)";
    } else if (geneDef.category === "compound") {
      labelAA = labels.major ? `${labels.major} (AA)` : "同型顯性 (AA)";
      labelAa = labels.middle ? `${labels.middle} (Aa)` : "異型 (Aa)";
      labelaa = labels.minor ? `${labels.minor} (aa)` : "同型隱性 (aa)";
    }

    return [
      { label: labelAA, value: "AA" },
      { label: labelAa, value: "Aa" },
      { label: labelaa, value: "aa" },
    ];
  } else if (geneDef.inputType === 'option' && geneDef.specialRuleKey && config) {
    const ruleMap = config.specialRules[geneDef.specialRuleKey];
    const uniqueAlleles = new Set();
    Object.keys(ruleMap || {}).forEach(key => {
      key.split('|').forEach(allele => uniqueAlleles.add(allele));
    });
    return Array.from(uniqueAlleles).map(a => ({ label: a, value: a }));
  }
  return [];
};
