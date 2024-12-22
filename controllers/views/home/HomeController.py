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


def role_required(role):
    def wrapper(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'role' not in session or session['role'] != role:
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
#@login_required
def addProduct():
    return render_template('welcome/home/forms/ProductsToMenu.html')


@home.route("/employee/admin")
#@login_required
def adminPanel():
    return render_template('welcome/home/Admin.html')


@home.route("/employee/mesas")
#@login_required
def mesasPanel():
    return render_template('welcome/home/Mesas.html')


@home.route('/employee/orders')
#@login_required
def ordersPanel():
    return render_template('welcome/home/Orders.html')


@home.route("/employee/history")
#@login_required
def historyPane():
    return render_template('welcome/home/Historial.html')


@home.route("/employee/register")
#@login_required
def registerEmployee():
    return render_template('welcome/home/Employee.html')


@home.route("/employee/orders/add")
#@login_required
def addOrders():
    return render_template('welcome/home/forms/OrderForm.html')


@home.route("/unauthorized")
def unauthorized():
    return "No tienes permiso para acceder a esta página.", 403


@home.route("/logout")
def logout():
    session.clear()
    flash("Sesión cerrada exitosamente.", "info")
    return redirect(url_for('home.login'))
