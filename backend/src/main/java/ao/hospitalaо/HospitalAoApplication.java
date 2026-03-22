package main.java.ao.hospitalaо;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * HospitalAO — Sistema de Gestão Hospitalar
 *
 * Ponto de entrada da aplicação Spring Boot.
 *
 * Anotações:
 *   @SpringBootApplication — activa a auto-configuração do Spring Boot.
 *     Equivale a três anotações combinadas:
 *       @Configuration       (esta classe define beans)
 *       @EnableAutoConfiguration (configurar automaticamente com base nas dependências)
 *       @ComponentScan       (procurar componentes no pacote ao.hospitalaо e subpacotes)
 *
 *   @EnableAsync — permite usar @Async nos métodos.
 *     Usado para operações demoradas como enviar email ou gerar PDF
 *     sem bloquear o thread principal da API.
 *
 *   @EnableScheduling — permite usar @Scheduled nos métodos.
 *     Usado para tarefas automáticas:
 *       - Backup diário da base de dados
 *       - Limpeza de tokens expirados no Redis
 *       - Relatórios automáticos mensais para a AGT
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class HospitalAoApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospitalAoApplication.class, args);
    }
}