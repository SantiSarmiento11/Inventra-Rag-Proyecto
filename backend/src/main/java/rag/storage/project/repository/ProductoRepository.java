package rag.storage.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rag.storage.project.entity.Producto;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByEstado(Boolean estado);
    List<Producto> findByStockLessThanEqual(Integer stock);
}
