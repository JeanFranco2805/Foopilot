from flask import Blueprint, request, jsonify
from model.dao.Employee import Employee
from model.dao.DetailOrder import DetallePedido
from model.db import db
from model.dao.Orders import Pedido
from datetime import datetime

pedido_bp = Blueprint('pedido_bp', __name__)


@pedido_bp.route('/details/<int:id_pedido>', methods=['GET'])
def obtener_detalles_pedido(id_pedido):
    try:
        pedido = Pedido.query.get(id_pedido)

        if not pedido:
            return jsonify({"error": "Pedido no encontrado"}), 404

        detalles = {
            "id_pedido": pedido.id_pedido,
            "fecha_hora": pedido.fecha_hora.strftime("%Y-%m-%d %H:%M:%S") if pedido.fecha_hora else None,
            "estado": pedido.estado,
            "total": pedido.Total,
            "productos": []
        }

        for detalle in pedido.detalles:
            producto = detalle.producto
            detalles["productos"].append({
                "nombre": producto.nombre,
                "cantidad": detalle.cantidad,
                "precio_unitario": float(producto.precio),
                "subtotal": float(producto.precio) * detalle.cantidad
            })

        return jsonify(detalles), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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


@pedido_bp.route('/insertar', methods=['POST'])
def insertar_pedido():
    try:
        data = request.get_json()

        required_fields = ["id_mesa", "id_empleado", "estado", "Total", "productos"]
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
        db.session.flush()

        productos = data.get("productos", [])
        for producto in productos:
            if "id_producto" not in producto or "cantidad" not in producto:
                return jsonify({"error": "Cada producto debe incluir 'id_producto' y 'cantidad'."}), 400

            detalle = DetallePedido(
                id_pedido=nuevo_pedido.id_pedido,
                id_producto=producto["id_producto"],
                cantidad=producto["cantidad"]
            )
            db.session.add(detalle)

        db.session.commit()

        return jsonify({"message": "Pedido insertado exitosamente.", "id_pedido": nuevo_pedido.id_pedido}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


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


@pedido_bp.route('/details', methods=['GET'])
def obtener_detalles_todos_pedidos():
    try:
        pedidos = Pedido.query.all()
        detalles = []

        for pedido in pedidos:
            pedido_detalles = {
                "id_pedido": pedido.id_pedido,
                "fecha_hora": pedido.fecha_hora.strftime("%Y-%m-%d %H:%M:%S") if pedido.fecha_hora else None,
                "estado": pedido.estado,
                "total": pedido.Total,
                "productos": []
            }

            for detalle in pedido.detalles:
                producto = detalle.producto
                pedido_detalles["productos"].append({
                    "nombre": producto.nombre,
                    "cantidad": detalle.cantidad,
                    "precio_unitario": float(producto.precio),
                    "subtotal": float(producto.precio) * detalle.cantidad
                })

            detalles.append(pedido_detalles)

        return jsonify(detalles), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pedido_bp.route('/cancelar/<int:pedido_id>', methods=['PUT'])
def cancelar_pedido(pedido_id):
    try:
        pedido = Pedido.query.filter_by(id_pedido=pedido_id).first()

        if not pedido:
            return jsonify({"error": f"No se encontró ningún pedido con el ID {pedido_id}"}), 404

        pedido.estado = 'Cancelado'
        db.session.commit()

        return jsonify({"message": f"Pedido con ID {pedido_id} cancelado exitosamente."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al cancelar el pedido: {str(e)}"}), 500


@pedido_bp.route('/cancelados', methods=['GET'])
def obtener_pedidos_cancelados():
    try:
        pedidos_cancelados = Pedido.query.filter_by(estado='Cancelado').all()

        resultado = [{
            "id_pedido": pedido.id_pedido,
            "fecha_hora": pedido.fecha_hora.strftime("%Y-%m-%d %H:%M:%S") if pedido.fecha_hora else None,
            "id_mesa": pedido.id_mesa,
            "mesero": f"{pedido.empleado.nombre} {pedido.empleado.apellido}",
            "estado": pedido.estado,
            "Total": pedido.Total
        } for pedido in pedidos_cancelados]

        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener pedidos cancelados: {str(e)}"}), 500


@pedido_bp.route('/actualizar/<int:pedido_id>', methods=['PUT'])
def actualizar_pedido(pedido_id):
    try:
        data = request.get_json()

        pedido = Pedido.query.filter_by(id_pedido=pedido_id).first()

        if not pedido:
            return jsonify({"message": f"No se encontró ningún pedido con el ID {pedido_id}"}), 404

        if "estado" in data and data["estado"] == "Completado":
            pedido.fecha_hora_despacho = datetime.now()

        if "id_mesa" in data:
            pedido.id_mesa = int(data["id_mesa"])
        if "Total" in data:
            pedido.Total = float(data["Total"])
        if "estado" in data:
            pedido.estado = data["estado"]

        db.session.commit()

        return jsonify({"message": f"Pedido con ID {pedido_id} actualizado exitosamente."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@pedido_bp.route('/find/<int:id_mesa>', methods=['GET'])
def buscar_pedido_por_mesa(id_mesa):
    try:
        pedido = Pedido.query.filter(
            Pedido.id_mesa == id_mesa,
            Pedido.estado == 'En proceso'
        ).first()

        if not pedido:
            return jsonify({"message": "No hay pedidos en proceso para esta mesa."}), 404

        detalles = {
            "id_pedido": pedido.id_pedido,
            "id_mesa": pedido.id_mesa,
            "estado": pedido.estado,
            "productos": [
                {
                    "id_producto": detalle.producto.id_producto,  # Cambiado a id_producto
                    "nombre": detalle.producto.nombre,
                    "cantidad": detalle.cantidad,
                    "precio": detalle.producto.precio
                }
                for detalle in pedido.detalles
            ]
        }
        return jsonify(detalles), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
