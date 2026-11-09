package rag.storage.project;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class ProjectApplication {

    public static void main(String[] args) {
        // Cargar obligatoriamente los datos seguros desde el archivo .env ubicado en la raíz del proyecto
        loadRootDotenv();

        SpringApplication.run(ProjectApplication.class, args);
    }

    private static void loadRootDotenv() {
        File currentDir = new File(System.getProperty("user.dir")).getAbsoluteFile();
        File rootEnvFile = null;

        // Búsqueda ascendente determinista hasta localizar el .env en la raíz del repositorio
        File dir = currentDir;
        while (dir != null) {
            File candidate = new File(dir, ".env");
            if (candidate.exists() && candidate.isFile()) {
                rootEnvFile = candidate;
                break;
            }
            dir = dir.getParentFile();
        }

        if (rootEnvFile != null) {
            Dotenv dotenv = Dotenv.configure()
                    .directory(rootEnvFile.getParent())
                    .filename(".env")
                    .ignoreIfMissing()
                    .load();

            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
            });
            System.out.println("[CONFIG] Variables de entorno y credenciales cargadas desde el .env raíz: " + rootEnvFile.getAbsolutePath());
        } else {
            System.err.println("[ADVERTENCIA] No se encontró el archivo .env en la raíz del proyecto.");
        }
    }
}
