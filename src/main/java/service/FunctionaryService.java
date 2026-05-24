package service;

import model.Functionary;
import model.FunctionaryDTO;
import repository.FunctionaryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FunctionaryService {

    private final FunctionaryRepository repository;

    public FunctionaryService(FunctionaryRepository repository) {
        this.repository = repository;
    }

    public Functionary saveFunctionary(Functionary f) {
        validarNome(f.getName());
        validarSalario(f.getBaseSal());

        if (f.getBi() != null && repository.findByBi(f.getBi()).isPresent()) {
            throw new IllegalArgumentException("Erro: Já existe um funcionário registado com este BI.");
        }
        if (f.getBaseSal() < 0) {
            throw new IllegalArgumentException("Erro: O salário base não pode ser negativo.");
        }
        return repository.save(f);
    }

    // Retorna a lista já convertida em Records imutáveis para a Web
    public List<FunctionaryDTO> getAll() {
        return repository.findAll().stream()
                .map(FunctionaryDTO::new)
                .toList(); // .toList() direto e imutável do Java moderno
    }

    public FunctionaryDTO getById(Long id) {
        return repository.findById(id)
                .map(FunctionaryDTO::new)
                .orElseThrow(() -> new RuntimeException("Funcionário com ID " + id + " não encontrado."));
    }

    public List<FunctionaryDTO> getByName(String name) {
        return repository.findByNameContainingIgnoreCase(name).stream()
                .map(FunctionaryDTO::new)
                .toList();
    }

    public void deleteFunctionary(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Erro: ID inexistente na base de dados.");
        }
        repository.deleteById(id);
    }
    private void validarNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            throw new IllegalArgumentException("Nome não pode estar vazio");
        }

        // Apenas letras, acentos, espaços e hífens
        if (!nome.matches("^[A-Za-zÀ-ÿ\\s\\-]+$")) {
            throw new IllegalArgumentException("Nome deve conter apenas letras (números não são permitidos)");
        }
    }
    private void validarSalario(Double salario) {
        if (salario == null || salario < 0) {
            throw new IllegalArgumentException("Salário não pode ser negativo!");
        }
    }

    private void validarId(Long id) {
        if (id == null || id < 1) {
            throw new IllegalArgumentException("ID inválido!");
        }
    }

    // Felizardo
    public Functionary updateFunctionary(Long id, Functionary newData) {
        if (newData.getBaseSal() < 0) {
            throw new IllegalArgumentException("❌ Salário não pode ser negativo!");
        }

        return repository.findById(id)


                .map(functionaryExistence -> {
                    functionaryExistence.setName(newData.getName());
                    functionaryExistence.setJobTitle(newData.getJobTitle());
                    functionaryExistence.setDepartment(newData.getDepartment());
                    functionaryExistence.setStatus(newData.getStatus());
                    functionaryExistence.setBaseSal(newData.getBaseSal());   // ADICIONAR
                    functionaryExistence.setEmail(newData.getEmail());
                    return repository.save(functionaryExistence);
                })
                .orElseThrow(() -> new RuntimeException("Funcionário com o ID " + id + " não foi encontrado."));

        }
    }
