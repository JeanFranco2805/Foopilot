from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Date

db = SQLAlchemy()


class Employee(db.Model):
    __tablename__ = "Empleados"
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(50))
    apellido = db.Column(db.String(50))
    cargo = db.Column(db.String(50))
    estado = db.Column(db.String(10))
    fecha_contratacion = db.Column(db.Date())
    telefono = db.Column(db.String(15))
    correo = db.Column(db.String(50))
    password = db.Column(db.String(50))

    def __repr__(self):
        return "id: ", self.idd_empleado, " nombre: ", self.nombre, " apellido: ", self.cargo
