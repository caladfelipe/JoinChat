<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Buscar</title>  
</head>  
<body>  
    <form action="BuscarServlet" method="post">  
        <fieldset style="width: 300px">  
            <legend> BUSCAR USUARIO POR EMAIL: </legend>  
            <table>  
                <tr>  
                    <td>Email:</td>  
                    <td><input type="text" name="email" required="required" /></td>  
                </tr> 
                <input type="hidden" value="json" name="format" />
                <tr>  
                    <td><input type="submit" value="Buscar" /></td>  
                </tr>  
            </table>  
        </fieldset>  
    </form>  
</body>  
</html>