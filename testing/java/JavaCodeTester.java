import org.json.JSONArray;

public class JavaCodeTester {
  public static void main(String[] args) {
    String solutionCode = System.getenv("SOLUTION_CODE"),
      testCode = System.getenv("TEST_CODE"),
      testJson = System.getenv("TEST_JSON");
    JSONArray testResults = null;
    try {
      if (testJson != null) {
        testCode = new JUnitTestCodeGenerator().generate(testJson);
      }
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
