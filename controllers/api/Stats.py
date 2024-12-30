from flask import Blueprint, jsonify
from sqlalchemy import func
from model.dao.Employee import Employee
from model.dao.DetailOrder import DetallePedido
from model.dao.Orders import Pedido
from model.db import db

stats_bp = Blueprint("stats", __name__)

@stats_bp.route("/statistics", methods=["GET"])
def get_statistics():
    try:
        empleado_mes = (
            db.session.query(Employee.nombre, Employee.apellido, func.count(Pedido.id_pedido).label("total_pedidos"))
            .join(Pedido, Pedido.id_empleado == Employee.id)
            .filter(Pedido.estado == "Completado")
            .group_by(Employee.id)
            .order_by(func.count(Pedido.id_pedido).desc())
            .first()
        )

        empleado_mes_data = {
            "nombre": f"{empleado_mes[0]} {empleado_mes[1]}",
            "total_pedidos": empleado_mes[2],
        } if empleado_mes else {"nombre": "Desconocido", "total_pedidos": 0}

        producto_mas_vendido = (
            db.session.query(DetallePedido.id_producto, func.sum(DetallePedido.cantidad).label("total_cantidad"))
            .group_by(DetallePedido.id_producto)
            .order_by(func.sum(DetallePedido.cantidad).desc())
            .first()
        )

        if producto_mas_vendido:
            producto = db.session.query(DetallePedido).filter_by(id_producto=producto_mas_vendido.id_producto).first()
            producto_data = {
                "nombre": producto.producto.nombre,
                "unidades": producto_mas_vendido.total_cantidad,
            }
        else:
            producto_data = {"nombre": "Desconocido", "unidades": 0}

        return jsonify({
            "empleado_mes": empleado_mes_data,
            "producto_mas_vendido": producto_data,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
