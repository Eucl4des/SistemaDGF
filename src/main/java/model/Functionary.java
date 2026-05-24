package model;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_functionary")
public class Functionary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String bi;

    private String jobTitle;
    private String status;

    @Column(unique = true)  // NOVO CAMPO
    private String email;    // NOVO CAMPO

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    private double baseSal = 100000.0; // Valor padrão

    // Construtor padrão
    public Functionary() {}

    public Functionary(String name, String bi, String jobTitle, String status,
                       Department department, double baseSal, String email) {
        this.name = name;
        this.bi = bi;
        this.jobTitle = jobTitle;
        this.status = status;
        this.department = department;
        this.baseSal = baseSal;
        this.email = email;
    }

    // NOVO MÉTODO: Calcular salário total
    public double getTotalSalary() {
        double bonus = 0;
        if (jobTitle != null) {
            if (jobTitle.equalsIgnoreCase("Gerente")) bonus = 50000;
            else if (jobTitle.equalsIgnoreCase("Coordenador")) bonus = 30000;
            else if (jobTitle.equalsIgnoreCase("Senior")) bonus = 20000;
        }
        return this.baseSal + bonus;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBi() { return bi; }
    public void setBi(String bi) { this.bi = bi; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public void setStatus(String status) { this.status = status; }
    public String getStatus() { return status; }
    public void setDepartment(Department department) { this.department = department; }
    public Department getDepartment() { return department; }
    public double getBaseSal() { return baseSal; }
    public void setBaseSal(double baseSal) { this.baseSal = baseSal; }
    public String getEmail() { return email; }      // NOVO
    public void setEmail(String email) { this.email = email; }  // NOVO
}