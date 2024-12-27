from flask_sqlalchemy import SQLAlchemy
from model.db import db


class Categories(db.Model):
    __tablename__ = "Categorias"  # Nombre de la tabla
    id_categoria = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_categoria = db.Column(db.String(50), nullable=False, unique=True)

    # Relación con Productos
    productos = db.relationship(
        'Product',  # Modelo relacionado
        backref='categoria',  # Nombre del atributo en el modelo relacionado
        lazy=True,  # Carga diferida
        cascade="all, delete-orphan"  # Opcional: manejar cascada en operaciones
    )

    def __repr__(self):
        return f"<Categories {self.nombre_categoria}>"
