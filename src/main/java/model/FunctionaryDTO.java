package model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record FunctionaryDTO(
        @Positive(message = "ID deve ser positivo")
        Long id,

        @NotBlank(message = "Nome é obrigatório")
        @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s\\-]+$", message = "Nome deve conter apenas letras")
        String name,

        String bi,

        String jobTitle,

        String department,

        String status,

        @PositiveOrZero(message = "Salário base não pode ser negativo")
        Double baseSalary,

        @PositiveOrZero(message = "Salário total não pode ser negativo")
        Double totalSalary,

        String email
) {
    public FunctionaryDTO(Functionary f) {
        this(
                f.getId(),
                f.getName(),
                f.getBi(),
                f.getJobTitle(),
                f.getDepartment() != null ? f.getDepartment().getName() : "Geral",
                f.getStatus(),
                f.getBaseSal(),
                f.getTotalSalary(),
                f.getEmail()
        );
    }
}