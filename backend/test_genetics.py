import unittest
from genetics_engine import canonicalize_genotype, cross_genotypes, resolve_dominant

class TestGeneticsEngine(unittest.TestCase):
    def test_canonicalize_genotype(self):
        self.assertEqual(canonicalize_genotype("Aa"), "Aa")
        self.assertEqual(canonicalize_genotype("aA"), "Aa")
        self.assertEqual(canonicalize_genotype("AA"), "AA")
        self.assertEqual(canonicalize_genotype("aa"), "aa")
        
    def test_cross_genotypes(self):
        # Aa x Aa = 25% AA, 50% Aa, 25% aa
        result = cross_genotypes("Aa", "Aa")
        self.assertEqual(result["AA"], 0.25)
        self.assertEqual(result["Aa"], 0.5)
        self.assertEqual(result["aa"], 0.25)

        # AA x aa = 100% Aa
        result = cross_genotypes("AA", "aa")
        self.assertEqual(result["Aa"], 1.0)
        self.assertEqual(len(result), 1)

    def test_resolve_dominant(self):
        # Aa x Aa dominant trait: 75% expressed, 25% not_expressed
        result = resolve_dominant("Aa", "Aa")
        self.assertEqual(result["expressed"], 0.75)
        self.assertEqual(result["not_expressed"], 0.25)

if __name__ == '__main__':
    unittest.main()
