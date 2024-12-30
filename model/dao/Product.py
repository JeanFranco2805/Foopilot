from model.db import db


class Product(db.Model):
    __tablename__ = "Productos"
    id_producto = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    precio = db.Column(db.Numeric, nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey("Categorias.id_categoria"), nullable=False)  # Clave foránea
    imagen = db.Column(db.Text, nullable=True)
    descripcion = db.Column(db.String(425))

    def __repr__(self):
        return f"<Product {self.nombre} (${self.precio})>"
