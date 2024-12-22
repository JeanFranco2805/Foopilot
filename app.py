from flask import Flask, render_template
from model.db import db  # Importar SQLAlchemy
import os
import psycopg2

# Crear aplicación Flask
app = Flask(__name__, template_folder='templates')

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:0219@localhost:5432/PuntoFrio'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar SQLAlchemy
db.init_app(app)

# Verificar conexión a la base de datos
try:
    connection = psycopg2.connect(
        host="localhost",
        database="PuntoFrio",
        user="postgres",
        password="0219"
    )
    connection.close()
    print("Conexión a la base de datos exitosa.")
except Exception as e:
    print(f"Error al conectar a la base de datos: {e}")

# Importar modelos para garantizar el orden de creación de tablas

from model.dao.Table import Mesa
from model.dao.Orders import Pedido
from model.dao.Employee import Employee
from model.dao.Categories import Categories
from model.dao.Product import Product

# Crear tablas solo en entornos de desarrollo
with app.app_context():
    try:
        db.create_all()  # Crear todas las tablas
        print("Tablas creadas exitosamente.")
    except Exception as e:
        print(f"Error al crear tablas: {e}")

# Importar y registrar Blueprints
from controllers.views.auth.AuthController import authController
from controllers.views.home.HomeController import home
from controllers.api.Employee import employee
from controllers.api.Categories import categories_bp
from controllers.api.Product import product
from controllers.api.Table import mesas_bp
from controllers.api.Orders import pedido_bp

# Registrar Blueprints
app.register_blueprint(authController, url_prefix='/auth')
app.register_blueprint(home, url_prefix='/home')
app.register_blueprint(employee, url_prefix='/api/employee')
app.register_blueprint(categories_bp, url_prefix='/api/categories')
app.register_blueprint(product, url_prefix='/api/products')
app.register_blueprint(mesas_bp, url_prefix='/api/mesas')
app.register_blueprint(pedido_bp, url_prefix='/api/orders')

# Clave secreta para sesiones
app.secret_key = '20050528'

# Ruta principal
@app.route('/')
def Dashboard():
    return render_template('welcome/Dashboard.html')

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(port=8080, host='0.0.0.0', debug=True)