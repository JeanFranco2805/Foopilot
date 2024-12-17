from flask import Blueprint, render_template

home = Blueprint("home", __name__, template_folder="../../templates/welcome/home")


@home.route("/")
def Home():
    return render_template('welcome/home/Home.html')


@home.route("/employee/product")
def addProduct():
    return render_template('welcome/home/forms/ProductsToMenu.html')


@home.route("/employee/admin")
def adminPanel():
    return render_template('welcome/home/Admin.html')

@home.route("/employee/mesas")
def mesasPanel():
    return render_template('welcome/home/Mesas.html')


@home.route('/employee/orders')
def ordersPanel():
    return render_template('welcome/home/Orders.html')


@home.route("/employee/history")
def historyPane():
    return render_template('welcome/home/Historial.html')


@home.route("/employee/register")
def registerEmployee():
    return render_template('welcome/home/Employee.html')