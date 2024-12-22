from flask import Blueprint, request, jsonify
from model.dao.Employee import Employee
from model.db import db
from model.dao.Orders import Pedido
from datetime import datetime

pedido_bp = Blueprint('pedido_bp', __name__)

# Obtener detalles de un pedido por ID
@pedido_bp.route('/details/<int:id_pedido>', methods=['GET'])
def obtener_detalles_pedido(id_pedido):
    try:
        pedido = Pedido.query.get(id_pedido)

        if not pedido:
            return jsonify({"error": "Pedido no encontrado"}), 404

        detalles = {
            "id_pedido": pedido.id_pedido,
            "fecha_hora": pedido.fecha_hora.strftime("%Y-%m-%d %H:%M:%S") if pedido.fecha_hora else None,
            "fecha_hora_despacho": pedido.fecha_hora_despacho.strftime("%Y-%m-%d %H:%M:%S") if pedido.fecha_hora_despacho else None,
            "id_mesa": pedido.id_mesa,
            "id_empleado": pedido.id_empleado,
            "estado": pedido.estado,
            "total": pedido.Total
        }

        return jsonify(detalles), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Buscar pedidos por ID de mesa
@pedido_bp.route('/buscar/<int:id_mesa>', methods=['GET'])
def buscar_pedidos(id_mesa):
    try:
        pedidos = Pedido.query.filter_by(id_mesa=id_mesa).all()
        if not pedidos:
            return jsonify({"message": f"No se encontraron pedidos para la mesa {id_mesa}"}), 404

        resultado = [{
            "id_pedido": pedido.id_pedido,
            "fecha_hora": pedido.fecha_hora,
            "fecha_hora_despacho": pedido.fecha_hora_despacho,
            "id_mesa": pedido.id_mesa,
            "id_empleado": pedido.id_empleado,
            "estado": pedido.estado,
            "Total": pedido.Total
        } for pedido in pedidos]

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Insertar un nuevo pedido
@pedido_bp.route('/insertar', methods=['POST'])
def insertar_pedido():
    try:
        data = request.get_json()

        required_fields = ["id_mesa", "id_empleado", "estado", "Total"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"El campo '{field}' es obligatorio."}), 400

        nuevo_pedido = Pedido(
            fecha_hora=data.get("fecha_hora", datetime.now()),
            fecha_hora_despacho=data.get("fecha_hora_despacho"),
            id_mesa=data["id_mesa"],
            id_empleado=data["id_empleado"],
            estado=data["estado"],
            Total=data["Total"]
        )

        db.session.add(nuevo_pedido)
        db.session.commit()

        return jsonify({"message": "Pedido insertado exitosamente.", "id_pedido": nuevo_pedido.id_pedido}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Obtener todos los pedidos
@pedido_bp.route('/all', methods=['GET'])
def obtener_todos_pedidos():
    try:
        pedidos = db.session.query(Pedido, Employee).join(Employee, Pedido.id_empleado == Employee.id).all()

        if not pedidos:
            return jsonify({"message": "No hay pedidos registrados."}), 404

        resultado = [
            {
                "id_pedido": pedido.id_pedido,
                "fecha_hora": pedido.fecha_hora.strftime("%Y-%m-%d %H:%M:%S") if pedido.fecha_hora else None,
                "fecha_hora_despacho": pedido.fecha_hora_despacho.strftime(
                    "%Y-%m-%d %H:%M:%S") if pedido.fecha_hora_despacho else None,
                "id_mesa": pedido.id_mesa,
                "mesero": f"{empleado.nombre} {empleado.apellido}",
                "estado": pedido.estado,
                "Total": pedido.Total
            }
            for pedido, empleado in pedidos
        ]

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"error": f"Error al obtener pedidos: {str(e)}"}), 500


# Actualizar un pedido
@pedido_bp.route('/actualizar/<int:pedido_id>', methods=['PUT'])
def actualizar_pedido(pedido_id):
    try:
        data = request.get_json()

        pedido = Pedido.query.filter_by(id_pedido=pedido_id).first()

        if not pedido:
            return jsonify({"message": f"No se encontró ningún pedido con el ID {pedido_id}"}), 404

        if "fecha_hora" in data:
            pedido.fecha_hora = datetime.strptime(data["fecha_hora"], "%Y-%m-%d %H:%M:%S")
        if "fecha_hora_despacho" in data:
            pedido.fecha_hora_despacho = datetime.strptime(data["fecha_hora_despacho"], "%Y-%m-%d %H:%M:%S")
        if "id_mesa" in data:
            pedido.id_mesa = data["id_mesa"]
        if "id_empleado" in data:
            pedido.id_empleado = data["id_empleado"]
        if "estado" in data:
            pedido.estado = data["estado"]
        if "Total" in data:
            pedido.Total = data["Total"]

        db.session.commit()

        return jsonify({"message": f"Pedido con ID {pedido_id} actualizado exitosamente."}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Eliminar un pedido
@pedido_bp.route('/eliminar/<int:pedido_id>', methods=['DELETE'])
def eliminar_pedido(pedido_id):
    try:
        pedido = Pedido.query.filter_by(id_pedido=pedido_id).first()

        if not pedido:
            return jsonify({"error": f"No se encontró ningún pedido con el ID {pedido_id}"}), 404

        db.session.delete(pedido)
        db.session.commit()

        return jsonify({"message": f"Pedido con ID {pedido_id} eliminado exitosamente."}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al eliminar el pedido: {str(e)}"}), 500
