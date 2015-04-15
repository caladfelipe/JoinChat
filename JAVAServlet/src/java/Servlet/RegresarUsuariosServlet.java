package Servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import Archivos.RegresarUsuarios;
import Archivos.Usuario1;
import java.util.ArrayList;
import org.json.simple.*;

public class RegresarUsuariosServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        String e = request.getParameter("username");
        
        ArrayList<Usuario1> u = RegresarUsuarios.validate(e);
        if (u!=null) {
            String format = request.getParameter("format");
            
            if (format.equals("json")) {
                JSONObject json = new JSONObject();
                json.put("success", true);
                
                    JSONObject user = new JSONObject();
                for (int i = 0; i < u.size(); i++) {
                    user.put("idUsuario", u.get(i).getidUsuario());
                    user.put("usuario", u.get(i).getidUsuario());
                    user.put("password", u.get(i).getPassword());
                    user.put("nickname",u.get(i).getNickname());
                    user.put("email", u.get(i).getEmail());
                    user.put("status",u.get(i).getStatus());
                    json.put("user", user);
                    out.print(user);
                }             
                    
            }
        } else {
            String format = request.getParameter("format");
            if (format.equals("json")) {
                JSONObject json = new JSONObject();
                json.put("success", false);
                json.put("message","ERROR");
                out.print(json);
               
                
            }

        }

        out.close();
    }
}
