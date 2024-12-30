from flask import Blueprint, request, jsonify

from model.dao.Employee import Employee
from model.dao.Orders import Pedido
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
        mesas = db.session.query(
            Mesa,
            Employee.nombre,
            Employee.apellido
        ).outerjoin(Employee, Mesa.id_empleado == Employee.id).filter(Mesa.estado == 'DISPONIBLE').all()

        mesas_json = []
        for mesa, nombre, apellido in mesas:
            mesas_json.append({
                "id": mesa.id_mesa,
                "nombre": f"Mesa #{mesa.id_mesa}",
                "estado": mesa.estado,
                "mesero": f"{nombre} {apellido}" if nombre and apellido else "Ninguno"
            })

        return jsonify(mesas_json), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@mesas_bp.route('/delete/<int:id>', methods=['DELETE'])
def delete_mesa(id):
    try:
        mesa = Mesa.query.get(id)
        if mesa:
            mesa.estado = 'INACTIVA'
            db.session.commit()
            return jsonify({"message": "Mesa marcada como INACTIVA exitosamente!"}), 200
        else:
            return jsonify({"error": "Mesa no encontrada"}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@mesas_bp.route('/assign_employee', methods=['PUT'])
def assign_employee_to_mesa():
    try:
        data = request.get_json()
        id_mesa = data.get('id_mesa')
        id_empleado = data.get('id_empleado')

        if not id_mesa or not id_empleado:
            return jsonify({"error": "Se requieren 'id_mesa' y 'id_empleado' para asignar."}), 400

        mesa = Mesa.query.get(id_mesa)
        if not mesa:
            return jsonify({"error": f"Mesa con ID {id_mesa} no encontrada."}), 404

        mesa.id_empleado = id_empleado
        db.session.commit()

        return jsonify({"message": f"Empleado con ID {id_empleado} asignado a la mesa con ID {id_mesa}."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@mesas_bp.route('/empleado/<int:id_empleado>', methods=['GET'])
def mesas_por_empleado(id_empleado):
    try:
        mesas = db.session.query(Mesa).filter(Mesa.id_empleado == id_empleado).all()

        if not mesas:
            return jsonify({"message": f"El empleado con ID {id_empleado} no está atendiendo ninguna mesa."}), 404

        mesas_json = [
            {
                "id": mesa.id_mesa,
                "nombre": mesa.nombre,
                "id_empleado": mesa.id_empleado
            }
            for mesa in mesas
        ]

        return jsonify(mesas_json), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
