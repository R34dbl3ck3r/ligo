package booker;

import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Runner JUnit 5 de la suite de API.
 *
 * <p>Se ejecuta con Maven:
 * <pre>
 *   mvn test                                  # toda la suite
 *   mvn test -Dkarate.options="--tags @smoke" # sólo smoke (Pull Request)
 *   mvn test -Dkarate.env=local               # contra un entorno local
 * </pre>
 *
 * <p>Karate genera el reporte HTML en {@code target/karate-reports/karate-summary.html}.
 */
class BookerRunnerTest {

    @Test
    void runAll() {
        Results results = Runner.path("classpath:booker/features")
                .outputCucumberJson(true)
                .outputJunitXml(true)
                // Paralelismo: cada escenario crea sus propios datos, por lo que
                // pueden ejecutarse a la vez sin interferencias.
                .parallel(4);

        assertEquals(0, results.getFailCount(), results.getErrorMessages());
    }
}
