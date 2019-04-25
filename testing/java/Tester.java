import org.json.JSONArray;

public class Tester {
  public static void main(String[] args) {
    String solutionCode = System.getenv("SOLUTION_CODE"), testCode = System.getenv("TEST_CODE");
    JSONArray testResults = null;
    try {
      testResults = new JavaCodeJUnitTester().test(solutionCode, testCode);
    } catch (Throwable throwable) {
      System.exit(
        throwable instanceof SyntaxException ? 1
        : throwable instanceof CompilationException ? 2
        : 255
      );
    }
    System.out.print(testResults);
  }
}
