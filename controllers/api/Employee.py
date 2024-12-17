from flask import Flask, request, jsonify, Blueprint
from datetime import datetime
from flask import Blueprint, jsonify, request
from model.dao.Employee import Employee, db

app = Flask(__name__)
employee = Blueprint("employee", __name__)
emp = Employee()
session = db.session


@employee.route("/all", methods=["GET"])
def get_all_employees():
    empleados = Employee.query.all()
    return jsonify([
        {
            "id": e.id,
            "nombre": e.nombre,
            "apellido": e.apellido,
            "cargo": e.cargo,
            "estado": e.estado,
            "fecha_contratacion": e.fecha_contratacion.strftime("%Y-%m-%d") if e.fecha_contratacion else None,
            "telefono": e.telefono,
            "correo": e.correo,
            "password": e.password

        }
        for e in empleados
    ]), 200


@employee.route("/email/<string:correo>", methods=["GET"])
def get_employee_by_email(correo):
    try:
        empleado = Employee.query.filter_by(correo=correo).first()

        if not empleado:
            return jsonify({"error": f"Empleado con correo {correo} no encontrado"}), 404

        return jsonify({
            "id": empleado.id,
            "nombre": empleado.nombre,
            "apellido": empleado.apellido,
            "cargo": empleado.cargo,
            "estado": empleado.estado,
            "fecha_contratacion": empleado.fecha_contratacion.strftime(
                "%Y-%m-%d") if empleado.fecha_contratacion else None,
            "telefono": empleado.telefono,
            "correo": empleado.correo,
            "password": empleado.password
        }), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener empleado: {str(e)}"}), 500


@employee.route("/login", methods=["POST"])
def login_employee():
    data = request.json

    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email y password son requeridos"}), 400

    email = data["email"]
    password = data["password"]

    empleado = Employee.query.filter_by(correo=email).first()

    if not empleado or empleado.password != password:  # Aquí puedes agregar hash comparativo si es necesario.
        return jsonify({"error": "Credenciales incorrectas"}), 401

    return jsonify({
        "message": "Inicio de sesión exitoso",
        "id": empleado.id,
        "nombre": empleado.nombre,
        "apellido": empleado.apellido
    }), 200



@employee.route("/add", methods=["POST"])
def add_employee():
    try:
        data = request.json

        required_fields = ["nombre", "apellido", "cargo", "estado", "telefono", "correo", "password"]
        if not data or not all(field in data for field in required_fields):
            missing = [field for field in required_fields if field not in data]
            return jsonify({"error": f"Faltan campos requeridos: {', '.join(missing)}"}), 400

        fecha_contratacion = None
        if "fecha_contratacion" in data and data["fecha_contratacion"]:
            try:
                fecha_contratacion = datetime.strptime(data["fecha_contratacion"], "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"error": "Formato de fecha incorrecto, use YYYY-MM-DD"}), 400

        nuevo_empleado = Employee(
            nombre=data["nombre"],
            apellido=data["apellido"],
            cargo=data["cargo"],
            estado=data["estado"],
            fecha_contratacion=fecha_contratacion,
            telefono=data["telefono"],
            correo=data["correo"],
            password=data["password"]
        )
        db.session.add(nuevo_empleado)
        db.session.commit()

        return jsonify({"message": "Empleado agregado exitosamente", "empleado_id": nuevo_empleado.id}), 201

    except Exception as e:
        return jsonify({"error": f"Error al agregar empleado: {str(e)}"}), 500


@employee.route("/email/<string:correo>", methods=["PUT"])
def update_employee_by_email(correo):
    data = request.json
    empleado = Employee.query.filter_by(correo=correo).first()

    if not empleado:
        return jsonify({"error": f"Empleado con correo {correo} no encontrado"}), 404

    try:
        if "nombre" in data:
            empleado.nombre = data["nombre"]
        if "apellido" in data:
            empleado.apellido = data["apellido"]
        if "cargo" in data:
            empleado.cargo = data["cargo"]
        if "estado" in data:
            empleado.estado = data["estado"]
        if "fecha_contratacion" in data:
            empleado.fecha_contratacion = datetime.strptime(data["fecha_contratacion"], "%Y-%m-%d")
        if "telefono" in data:
            empleado.telefono = data["telefono"]
        if "password" in data:
            empleado.password = data["password"]

        db.session.commit()
        return jsonify({"message": f"Empleado con correo {correo} actualizado exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": f"Error al actualizar empleado: {str(e)}"}), 500


@employee.route("/delete", methods=["POST"])
def delete_employee_by_email():
    data = request.json

    if not data or "email" not in data:
        return jsonify({"error": "El campo 'email' es obligatorio"}), 400

    email = data["email"]
    empleado = Employee.query.filter_by(correo=email).first()

    if not empleado:
        return jsonify({"error": f"No se encontró ningún empleado con el correo {email}"}), 404

    try:
        db.session.delete(empleado)
        db.session.commit()
        return jsonify({"message": f"Empleado con correo {email} eliminado exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": f"Error al eliminar empleado: {str(e)}"}), 500
