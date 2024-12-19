from model.db import db


class Mesa(db.Model):
    __tablename__ = 'mesas'
    id_mesa = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    orders = db.relationship('Pedido', backref='mesa_relacionada', lazy=True)

    def __init__(self, nombre):
        self.nombre = nombre
