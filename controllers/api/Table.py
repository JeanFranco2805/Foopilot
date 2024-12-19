from flask import Blueprint, request, jsonify
from model.dao.Table import Mesa
from model.db import db

mesas_bp = Blueprint('mesas', __name__)


@mesas_bp.route('/insert', methods=['POST'])
def insert_mesa():
    try:
        data = request.get_json()
        nueva_mesa = Mesa(nombre=data.get('nombre'))  # Actualizado
        db.session.add(nueva_mesa)
        db.session.commit()
        print(nueva_mesa)
        return jsonify({"message": "Mesa creada exitosamente!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
        print("Fin")


@mesas_bp.route('/list', methods=['GET'])
def list_mesas():
    try:
        mesas = Mesa.query.all()
        mesas_json = [{"id": m.id_mesa, "nombre": m.nombre} for m in mesas]
        return jsonify(mesas_json), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@mesas_bp.route('/delete/<int:id>', methods=['DELETE'])
def delete_mesa(id):
    try:
        mesa = Mesa.query.get(id)
        if mesa:
            db.session.delete(mesa)
            db.session.commit()
            return jsonify({"message": "Mesa eliminada exitosamente!"}), 200
        else:
            return jsonify({"error": "Mesa no encontrada"}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
