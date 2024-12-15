
from flask import jsonify, Blueprint, request

from model.dao.Product import Product
from app import db


product = Blueprint("products", __name__)

prod = Product()

session = db.session


@product.route('/productos', methods=['GET'])
def get_all_products():
    productos = Product.query.all()
    result = [{
        'id': p.id,
        'nombre': p.nombre,
        'precio': float(p.precio),
        'categoria_id': p.categoria_id
    } for p in productos]
    return jsonify(result), 200


@product.route('/productos', methods=['POST'])
def add_product():
    data = request.get_json()
    nombre = data.get('nombre')
    precio = data.get('precio')
    categoria_id = data.get('categoria_id')

    if not all([nombre, precio, categoria_id]):
        return jsonify({'error': 'Faltan datos'}), 400

    new_product = Product(nombre=nombre, precio=precio, categoria_id=categoria_id)
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Producto creado exitosamente'}), 201


@product.route('/productos/<int:id>', methods=['PUT'])
def update_product(id):
    productos = Product.query.get_or_404(id)
    data = request.get_json()
    productos.nombre = data.get('nombre', productos.nombre)
    productos.precio = data.get('precio', productos.precio)
    productos.categoria_id = data.get('categoria_id', productos.categoria_id)

    db.session.commit()
    return jsonify({'message': 'Producto actualizado exitosamente'}), 200


@product.route('/productos/<int:id>', methods=['DELETE'])
def delete_product(id):
    productos = Product.query.get_or_404(id)
    db.session.delete(productos)
    db.session.commit()
    return jsonify({'message': 'Producto eliminado exitosamente'}), 200
