import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.github.javaparser.utils.StringEscapeUtils;

import org.json.JSONArray;
import org.json.JSONObject;

public class JUnitTestCodeGenerator {

  private JSONObject test;

  public JUnitTestCodeGenerator() { }

  public String generate(String testJson) {
    this.test = new JSONObject(testJson);
    return String.format(
      "%s public class SolutionTest { %s %s }", getImportsCode(), getTestHelpersCode(), generateTestCasesCode()
    );
  }

  private String getImportsCode() {
    return new StringBuilder()
      .append("import java.util.Arrays;")
      .append("import org.junit.jupiter.api.DisplayName;")
      .append("import org.junit.jupiter.api.Test;")
      .append("import static org.junit.jupiter.api.Assertions.assertArrayEquals;")
      .append("import static org.junit.jupiter.api.Assertions.assertEquals;")
      .append("import static org.junit.jupiter.api.Assertions.assertFalse;")
      .append("import static org.junit.jupiter.api.Assertions.assertNotEquals;")
      .toString();
  }

  private String getTestHelpersCode() {
    StringBuilder testHelpers = new StringBuilder();
    for (Class clazz : new Class[] { int.class, double.class, boolean.class, String.class }) {
      String type = clazz.getSimpleName();
      testHelpers
        .append(String.format("private void assertArrayNotEquals(%s[] expected, %s[] actual) {", type, type))
        .append("assertFalse(Arrays.equals(expected, actual));")
        .append("}");
    }
    return testHelpers.toString();
  }

  private String generateTestCasesCode() {
    JSONArray testCases = test.getJSONArray("testCases");
    StringBuilder testCasesCode = new StringBuilder();
    for (int i = 0; i < testCases.length(); i++) {
      testCasesCode.append(generateTestCaseCode(testCases.getJSONObject(i), i));
    }
    return testCasesCode.toString();
  }

  private String generateTestCaseCode(JSONObject testCase, int index) {
    String description = testCase.getString("description");
    String matcher = testCase.getString("matcher");
    JSONObject expected = testCase.getJSONObject("expected");
    String functionCallCode = test.getString("functionCallCode");
    JSONArray parameters = testCase.getJSONArray("parameters");
    return String.format(
      "@Test @DisplayName(%s) public void test%d() { %s(%s, %s(%s)); }",
      generateStringCode(description), index, generateMatcherNameCode(matcher, expected),
      generateLiteralCode(expected), functionCallCode, generateParametersCode(parameters)
    );
  }

  private String generateMatcherNameCode(String matcher, JSONObject expected) {
    boolean expectsArray = expected.getString("type").matches("(integer|double|boolean|string) array");
    switch (matcher) {
      case "equals":
        return expectsArray ? "assertArrayEquals" : "assertEquals";
      case "not equals":
        return expectsArray ? "assertArrayNotEquals" : "assertNotEquals";
      default:
        return null;
    }
  }

  private String generateLiteralCode(JSONObject literal) {
    String type = literal.getString("type");
    String value = literal.getString("value");
    switch (type) {
      case "integer":
        return generateIntegerCode(value);
      case "double":
        return generateDoubleCode(value);
      case "boolean":
        return generateBooleanCode(value);
      case "string":
        return generateStringCode(value);
      case "integer array":
        return generateArrayCode(int.class.getSimpleName(), value, this::generateIntegerCode);
      case "double array":
        return generateArrayCode(double.class.getSimpleName(), value, this::generateDoubleCode);
      case "boolean array":
        return generateArrayCode(boolean.class.getSimpleName(), value, this::generateBooleanCode);
      case "string array":
        return generateArrayCode(String.class.getSimpleName(), value, this::generateStringCode);
      default:
        return null;
    }
  }

  private String generateIntegerCode(String value) {
    return value;
  }

  private String generateDoubleCode(String value) {
    return String.format("%sd", value);
  }

  private String generateBooleanCode(String value) {
    return value;
  }

  private String generateStringCode(String value) {
    return String.format("\"%s\"", StringEscapeUtils.escapeJava(value));
  }

  private String generateArrayCode(String type, String value, Function<String, String> generateElementCode) {
    return String.format("new %s[] { %s }", type,
      Stream.of(value.split("(?<!\\\\)\\|"))
      .map(element -> element.replace("\\|", "|"))
      .map(generateElementCode)
      .collect(Collectors.joining(","))
    );
  }

  private String generateParametersCode(JSONArray parameters) {
    String[] parameterCodes = new String[parameters.length()];
    for (int i = 0; i < parameterCodes.length; i++) {
      parameterCodes[i] = generateLiteralCode(parameters.getJSONObject(i));
    }
    return String.join(",", parameterCodes);
  }
}
