# ============================================================
# HospitalAO Backend — Dockerfile (Multi-stage)
# ============================================================
#
# Como funciona o multi-stage:
#   - "docker compose up" em dev usa o target: development (Stage 1)
#   - O CI e produção usam o target: production (Stage 3)
#
# Porquê Maven cache separado?
#   Na primeira vez, Maven descarrega ~150MB de dependências.
#   Com o layer cache do Docker, nas próximas builds só
#   recompila o teu código (segundos, não minutos).
# ============================================================


# ==============================================================
# STAGE 1 — development
# ==============================================================
# Usado pelo docker-compose.yml em desenvolvimento.
# O código fonte é montado via volume (não copiado para a imagem),
# por isso qualquer alteração no teu PC é vista imediatamente.
# ==============================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS development

# Definir a pasta de trabalho dentro do container
WORKDIR /workspace

# TRUQUE DE PERFORMANCE:
# Copiar só o pom.xml PRIMEIRO, antes do código fonte.
# O Docker guarda cada instrução em cache. Se o pom.xml
# não mudou, a instrução "go-offline" não corre de novo
# na próxima build — poupa vários minutos.
COPY pom.xml .

# Descarregar todas as dependências Maven antecipadamente
# "-B" = modo batch (sem interacção), "--no-transfer-progress" = logs mais limpos
RUN mvn dependency:go-offline -B --no-transfer-progress

# Copiar o código fonte (depois do pom.xml para aproveitar cache)
COPY src ./src

# Activar o debug remoto Java na porta 5005
# Isto permite ligar o debugger do IntelliJ ou VS Code
# ao container e colocar breakpoints no código
ENV JAVA_TOOL_OPTIONS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"

# Expor as portas usadas por este stage
EXPOSE 8080 5005

# Comando de arranque: spring-boot:run activa o DevTools
# que monitoriza alterações de ficheiros e reinicia o servidor
CMD ["mvn", "spring-boot:run", \
     "-Dspring-boot.run.jvmArguments=-Xmx512m", \
     "--no-transfer-progress"]


# ==============================================================
# STAGE 2 — builder
# ==============================================================
# Não é usado directamente — serve para compilar e empacotar
# o JAR que o Stage 3 (production) vai usar.
# ==============================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Mesmo truque de cache do Stage 1
COPY pom.xml .
RUN mvn dependency:go-offline -B --no-transfer-progress

COPY src ./src

# Compilar o projecto e criar o JAR
# "-DskipTests" = não correr testes aqui (o CI trata disso separadamente)
RUN mvn package -DskipTests -B --no-transfer-progress

# Extrair o JAR em layers separadas para melhor cache Docker.
# O Spring Boot organiza o JAR em camadas:
#   1. dependencies      (muda raramente — bibliotecas externas)
#   2. spring-boot-loader (muda raramente)
#   3. snapshot-dependencies (muda às vezes — libs em desenvolvimento)
#   4. application       (muda sempre — o teu código)
# Assim, quando só o teu código muda, o Docker só precisa
# de re-enviar a camada "application" no deploy (muito mais rápido)
RUN java -Djarmode=layertools \
    -jar target/*.jar extract \
    --destination target/extracted


# ==============================================================
# STAGE 3 — production
# ==============================================================
# Imagem final de produção: mínima, segura, sem Maven.
# Parte do Stage 2 (builder) e copia apenas o necessário.
# ==============================================================
FROM eclipse-temurin:21-jre-alpine AS production

WORKDIR /app

# Criar um utilizador sem privilégios de root por segurança.
# Em produção nunca se deve correr aplicações como root.
RUN addgroup -S hospitalaо && \
    adduser -S hospitalaо -G hospitalaо

# Copiar as layers do builder pela ordem correcta.
# As primeiras layers mudam raramente → melhor cache Docker.
# A última layer (application) muda sempre que o código muda.
COPY --from=builder /build/target/extracted/dependencies/ ./
COPY --from=builder /build/target/extracted/spring-boot-loader/ ./
COPY --from=builder /build/target/extracted/snapshot-dependencies/ ./
COPY --from=builder /build/target/extracted/application/ ./

# Dar posse dos ficheiros ao utilizador não-root
RUN chown -R hospitalaо:hospitalaо /app

# Mudar para o utilizador não-root
USER hospitalaо

EXPOSE 8080

# Opções de memória JVM para produção:
# -Xms256m                  = memória mínima ao arrancar
# -Xmx512m                  = memória máxima
# -XX:+UseContainerSupport  = JVM reconhece os limites do container Docker
# -XX:MaxRAMPercentage=75.0 = usar até 75% da RAM disponível no container
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Arrancar a aplicação usando o JarLauncher do Spring Boot
ENTRYPOINT ["java", \
            "-cp", "BOOT-INF/lib/*:.", \
            "org.springframework.boot.loader.launch.JarLauncher"]