from model.db import db
from sqlalchemy import func

class Pedido(db.Model):
    __tablename__ = "Pedidos"  # Nombre de la tabla
    id_pedido = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fecha_hora = db.Column(db.TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    fecha_hora_despacho = db.Column(db.TIMESTAMP, nullable=True)
    id_mesa = db.Column(db.Integer, db.ForeignKey("Mesas.id_mesa"), nullable=False)  # Clave foránea
    id_empleado = db.Column(db.Integer, db.ForeignKey("Empleados.id"), nullable=False)  # Clave foránea
    estado = db.Column(db.String(20), nullable=True)
    Total = db.Column(db.Integer)

    def __repr__(self):
        return (
            f"<Pedido id_pedido={self.id_pedido}, fecha_hora={self.fecha_hora}, "
            f"fecha_hora_desc={self.fecha_hora_desc}, id_mesa={self.id_mesa}, "
            f"id_empleado={self.id_empleado}, estado={self.estado}>"
        )
