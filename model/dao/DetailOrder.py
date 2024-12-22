from model.db import db

class DetallePedido(db.Model):
    __tablename__ = "DetallePedido"
    id_pedido = db.Column(db.Integer, db.ForeignKey("Pedidos.id_pedido"), primary_key=True)
    id_producto = db.Column(db.Integer, db.ForeignKey("Productos.id_producto"), primary_key=True)
    cantidad = db.Column(db.Integer, nullable=False)

    # Relación con Product
    producto = db.relationship("Product", backref="detalle_pedidos")

    def __repr__(self):
        return f"<DetallePedido id_pedido={self.id_pedido}, id_producto={self.id_producto}, cantidad={self.cantidad}>"
