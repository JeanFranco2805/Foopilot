from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Product(db.Model):
    __tablename__ = "Productos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100))
    precio = db.Column(db.Numeric)
    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id"))

    def __repr__(self):
        return f"<Producto {self.nombre} (${self.precio})>"

class Categoria(db.Model):
    __tablename__ = "Categorias"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(50))

    def __repr__(self):
        return f"<Categoria {self.nombre}>"
