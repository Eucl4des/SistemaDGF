package controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login-admin")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String senha = credentials.get("senha");

        // Credenciais padrão para teste
        if ("admin@gestao.com".equals(email) && "admin123".equals(senha)) {
            return ResponseEntity.ok(Map.of(
                    "token", "admin-token-" + System.currentTimeMillis(),
                    "message", "Login realizado com sucesso"
            ));
        }

        return ResponseEntity.status(401).body(Map.of("error", "Credenciais inválidas"));
    }
}