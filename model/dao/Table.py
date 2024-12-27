from model.db import db


class Mesa(db.Model):
    __tablename__ = "Mesas"
    id_mesa = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    id_empleado = db.Column(db.Integer, db.ForeignKey('Empleados.id'), nullable=True)  # Relación con Empleados

    # Relación con Pedidos
    orders = db.relationship('Pedido', backref='mesa_relacionada', lazy=True)

    def __init__(self, nombre, id_empleado=None):
        self.nombre = nombre
        self.id_empleado = id_empleado