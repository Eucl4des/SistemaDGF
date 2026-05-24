package model;

public record FunctionaryDTO(
        Long id,
        String name,
        String bi,
        String jobTitle,
        String department,
        String status,
        Double baseSalary,
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