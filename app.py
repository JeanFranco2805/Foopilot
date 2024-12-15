from flask import Flask, render_template
from model.db import db
from controllers.views.auth.AuthController import authController
from controllers.views.home.HomeController import home
from controllers.api.Employee import employee
from controllers.api.Categories import categories_bp
from controllers.api.Product import product

# Crear aplicación Flask
app = Flask(__name__, template_folder='templates')

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:admin@localhost:5432/PuntoFrio'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar SQLAlchemy
db.init_app(app)

# Crear tablas al iniciar la aplicación
with app.app_context():
    db.create_all()

# Registrar Blueprints
app.register_blueprint(authController, url_prefix='/auth')
app.register_blueprint(home, url_prefix='/home')
app.register_blueprint(employee, url_prefix='/api/employee')
app.register_blueprint(categories_bp, url_prefix='/api/categories')
app.register_blueprint(product, url_prefix='/api/products')

# Ruta principal
@app.route('/')
def Dashboard():
    return render_template('welcome/Dashboard.html')

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(port=8080, host='0.0.0.0', debug=True)
