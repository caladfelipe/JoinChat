package Archivos;

import java.sql.Connection;  
import java.sql.DriverManager;  
import java.sql.PreparedStatement;  
import java.sql.ResultSet;  
import java.sql.SQLException;  
  
public class Login {  
    public static Usuario1 validate(String name, String pass) {          
        Usuario1 u = null;
        Connection conn = null;  
        PreparedStatement pst = null;  
        ResultSet rs = null;  
        
        String url = "jdbc:mysql://localhost/";  
        String dbName = "JoinChat";  
        String driver = "com.mysql.jdbc.Driver";  
        String userName = "root";  
        String password = "2403"; 

        try {  
            Class.forName(driver).newInstance();  
            conn = DriverManager.getConnection(url + dbName, userName, password);  
  
            pst = conn.prepareStatement("select * from Usuarios where usuario=? and password=?");  
            pst.setString(1, name);  
            pst.setString(2, pass);  
  
            rs = pst.executeQuery();
            
            if (rs.next()) {  
                String usuario = rs.getString("usuario");
                String pass2 = rs.getString("password");
                String nickname =rs.getString("nickname");
                String email =rs.getString("email");
                String status =rs.getString("status");
                u=new Usuario1(usuario, pass2, nickname, email, status);
            
            }
        } catch (Exception e) {  
            System.out.println(e);  
        } finally {  
            if (conn != null) {  
                try {  
                    conn.close();  
                } catch (SQLException e) {  
                    e.printStackTrace();  
                }  
            }  
            if (pst != null) {  
                try {  
                    pst.close();  
                } catch (SQLException e) {  
                    e.printStackTrace();  
                }  
            }  
            if (rs != null) {  
                try {  
                    rs.close();  
                } catch (SQLException e) {  
                    e.printStackTrace();  
                }  
            }  
        }  
        return u;  
    }  
}  