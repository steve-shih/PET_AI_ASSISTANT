from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# 允許跨域請求，方便前後端分離開發
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "running", "message": "Cat Genetics API is online."})

import json
import os
from genetics_engine import resolve_multiple_genes, expand_all_combinations

CONFIG_FILE_PATH = os.path.join(os.path.dirname(__file__), 'data.json')

def load_config():
    if not os.path.exists(CONFIG_FILE_PATH):
        return {"defaultSpecies": "cat", "species": {}, "specialRules": {}}
    with open(CONFIG_FILE_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_config(config_data):
    with open(CONFIG_FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(config_data, f, ensure_ascii=False, indent=2)

@app.route('/api/config', methods=['GET'])
def get_config():
    """提供前端渲染表單所需的基因設定檔"""
    return jsonify(load_config())
    
@app.route('/api/config/save', methods=['POST'])
def update_config():
    """允許前端自訂與儲存基因/物種設定 (新增物種/基因)"""
    new_config = request.json
    try:
        save_config(new_config)
        return jsonify({"status": "success", "message": "設定檔儲存成功"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/calculate', methods=['POST'])
def calculate_genetics():
    data = request.json
    
    species = data.get('species', 'cat')
    gene_inputs = data.get('genes', {})
    
    try:
        current_config = load_config()
        single_gene_results = resolve_multiple_genes(
            config=current_config,
            species_name=species,
            gene_inputs=gene_inputs
        )
        
        combination_results = expand_all_combinations(single_gene_results)
        
        # 過濾掉機率為 0 的結果
        filtered_combinations = [
            {
                "labels": item["labels"],
                "probability": item["probability"]
            }
            for item in combination_results if item["probability"] > 0
        ]
        
        return jsonify({
            "status": "success",
            "single_genes": single_gene_results,
            "combinations": filtered_combinations
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == '__main__':
    # 執行於 5000 port
    app.run(debug=True, port=5000)
