from functools import wraps

from flask import Blueprint, render_template, flash, redirect, url_for, session


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Por favor, inicia sesión para acceder a esta página.", "warning")
            return redirect(url_for('auth.Login'))
        return f(*args, **kwargs)

    return decorated_function


def roles_required(*roles):
    def wrapper(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'role' not in session or session['role'] not in roles:
                print(session.get('role'))  # Esto ayuda a depurar
                flash("No tienes permiso para acceder a esta página.", "danger")
                return redirect(url_for('home.unauthorized'))
            return f(*args, **kwargs)

        return decorated_function

    return wrapper


def role_required(role):
    def wrapper(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'role' not in session or session['role'] != role:
                print(session['role'])
                flash("No tienes permiso para acceder a esta página.", "danger")
                return redirect(url_for('home.unauthorized'))  # Redirige si no tiene permisos
            return f(*args, **kwargs)

        return decorated_function

    return wrapper


home = Blueprint("home", __name__, template_folder="../../templates/welcome/home")


@home.route("/")
def Home():
    return render_template('welcome/home/Home.html')


@home.route("/employee/product")
@roles_required('Administrador', 'Gerente')
@login_required
def addProduct():
    return render_template('welcome/home/forms/ProductsToMenu.html')


@home.route("/employee/admin")
@roles_required('Administrador', 'Gerente', 'Mesero', 'Chef', 'Cocinero')
@login_required
def adminPanel():
    return render_template('welcome/home/Admin.html')


@home.route("/employee/mesas")
@roles_required('Mesero', 'Administrador', 'Gerente')
@login_required
def mesasPanel():
    return render_template('welcome/home/Mesas.html')


@home.route('/employee/orders')
@roles_required('Mesero', 'Administrador', 'Gerente', 'Chef', 'Cocinero')
@login_required
def ordersPanel():
    return render_template('welcome/home/Orders.html')


@home.route("/employee/register")
@login_required
@roles_required('Administrador', 'Gerente')
def registerEmployee():
    return render_template('welcome/home/Employee.html')


@home.route("/employee/stats")
@roles_required('Administrador', 'Gerente')
def statistics():
    return render_template('welcome/home/Statistics.html')


@home.route("/employee/orders/add")
@roles_required('Mesero', 'Administrador', 'Gerente', 'Chef', 'Cocinero')
@login_required
def addOrders():
    return render_template('welcome/home/forms/OrderForm.html')


@home.route('/unauthorized')
def unauthorized():
    return render_template('welcome/error/Unauthorized.html')


@home.route('/employee/admin/update')
@roles_required('Administrador', 'Gerente')
def productUpdate():
    return render_template('welcome/home/forms/UpdateProductsToMenu.html')


@home.route("/logout")
def logout():
    session.clear()
    flash("Sesión cerrada exitosamente.", "info")
    return redirect(url_for('home.login'))
