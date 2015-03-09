package Archivos;

public class Usuario1 {
    String usuario;
    String password;
    String nickname;
    String email;
    String status;

    public Usuario1(String usuario, String password, String nickname, String email, String status) {
        this.usuario = usuario;
        this.password = password;
        this.nickname = nickname;
        this.email = email;
        this.status = status;
    }

    public String getUsuario() {
        return usuario;
    }

    public String getPassword() {
        return password;
    }

    public String getNickname() {
        return nickname;
    }

    public String getEmail() {
        return email;
    }

    public String getStatus() {
        return status;
    }
    
    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }

    
    

    
    
}
