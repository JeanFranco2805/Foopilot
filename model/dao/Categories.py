from model.db import db


class Categories(db.Model):
    __tablename__ = "Categorias"
    id_categoria = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_categoria = db.Column(db.String(50), nullable=False, unique=True)

    productos = db.relationship(
        'Product',
        backref='categoria',
        lazy=True,
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Categories {self.nombre_categoria}>"
