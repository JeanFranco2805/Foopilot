from flask import Blueprint, jsonify, request
from model.dao.Employee import Employee, db

employee = Blueprint("employee", __name__)
emp = Employee()
session = db.session


@employee.route("/all")
def employeeRequest():
    empleados = emp.query.all()
    return jsonify([{"nombre": u.nombre, "apellido": u.apellido} for u in empleados]), 200


@employee.route("/register", methods=["POST"])
def employeeRegister():
    data = request.get_json()
    session.add(Employee(
        nombre=data.get("nombre"),
        apellido=data.get("apellido"),
        cargo=data.get("cargo"),
        estado=data.get("estado"),
        fecha_contratacion=data.get("fecha_contratacion"),
        telefono=data.get("telefono")
    ))
    session.commit()
    return jsonify({"status": "Enviado"}), 200
