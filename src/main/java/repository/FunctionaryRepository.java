package repository;

import model.Functionary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FunctionaryRepository extends JpaRepository<Functionary, Long> {

    // Lógica da Loja-crudJava: Pesquisa por Nome ignorando Maiúsculas/Minúsculas
    List<Functionary> findByNameContainingIgnoreCase(String name);

    // Validação do Euclides: Verificar se já existe alguém com o mesmo BI
    Optional<Functionary> findByBi(String bi);
}
