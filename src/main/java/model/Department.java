// Felizardo

package model;

import jakarta.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "tb_department")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    // Relacionamento um-para-muitos (Um departamento tem muitos funcionários)
    // Usamos @JsonIgnore para evitar loops infinitos na leitura do JSON
    @OneToMany(mappedBy = "department")
    @JsonIgnore
    private List<Functionary> functionaries;

    // Construtor padrão necessário para o JPA
    public Department() {}

    public Department(String name) {
        this.name = name;
    }

    // --- GETTERS E SETTERS ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Functionary> getFunctionaries() {
        return functionaries;
    }

    public void setFunctionaries(List<Functionary> functionaries) {
        this.functionaries = functionaries;
    }
}