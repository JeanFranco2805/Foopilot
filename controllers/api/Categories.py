from flask import Blueprint, request, jsonify

from model.dao.Categories import Categories, db

categories_bp = Blueprint('categories_bp', __name__)

@categories_bp.route('/', methods=['GET'])
def get_all_categories():
    try:
        categories = Categories.query.all()
        return jsonify([
            {'id_categoria': c.id_categoria, 'nombre_categoria': c.nombre_categoria}
            for c in categories
        ]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Crear una nueva categoría
@categories_bp.route('/', methods=['POST'])
def create_category():
    data = request.get_json()
    nombre_categoria = data.get('nombre_categoria')

    if not nombre_categoria:
        return jsonify({'error': 'El campo "nombre_categoria" es requerido'}), 400

    try:
        nueva_categoria = Categories(nombre_categoria=nombre_categoria)
        db.session.add(nueva_categoria)
        db.session.commit()
        return jsonify({'message': 'Categoría creada exitosamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Actualizar una categoría por nombre
@categories_bp.route('/<string:nombre_categoria>', methods=['PUT'])
def update_category(nombre_categoria):
    data = request.get_json()
    nuevo_nombre = data.get('nuevo_nombre')

    if not nuevo_nombre:
        return jsonify({'error': 'El campo "nuevo_nombre" es requerido'}), 400

    try:
        categoria = Categories.query.filter_by(nombre_categoria=nombre_categoria).first()
        if not categoria:
            return jsonify({'error': 'Categoría no encontrada'}), 404

        categoria.nombre_categoria = nuevo_nombre
        db.session.commit()
        return jsonify({'message': 'Categoría actualizada exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Eliminar una categoría por nombre
@categories_bp.route('/<string:nombre_categoria>', methods=['DELETE'])
def delete_category(nombre_categoria):
    try:
        categoria = Categories.query.filter_by(nombre_categoria=nombre_categoria).first()
        if not categoria:
            return jsonify({'error': 'Categoría no encontrada'}), 404

        db.session.delete(categoria)
        db.session.commit()
        return jsonify({'message': 'Categoría eliminada exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
