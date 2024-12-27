from model.db import db


class Employee(db.Model):
    __tablename__ = "Empleados"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria
    nombre = db.Column(db.String(50))
    apellido = db.Column(db.String(50))
    cargo = db.Column(db.Text)
    estado = db.Column(db.String(10))
    fecha_contratacion = db.Column(db.Date())
    correo = db.Column(db.String(50))
    telefono = db.Column(db.String(20))
    password = db.Column(db.String(255))
    orders = db.relationship('Pedido', backref='empleado_relacionado', lazy=True)
    mesas = db.relationship('Mesa', backref='empleado_asignado', lazy=True)  # Relación con Mesas
    foto_perfil = db.Column(db.Text)
    def __repr__(self):
        return "id: ", self.id, " nombre: ", self.nombre, " apellido: ", self.cargo
