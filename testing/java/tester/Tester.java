import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.tools.JavaCompiler;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

import com.github.javaparser.ParseProblemException;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.PackageDeclaration;
import com.github.javaparser.ast.body.TypeDeclaration;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.discovery.ClassSelector;
import org.junit.platform.launcher.Launcher;
import org.junit.platform.launcher.TestExecutionListener;
import org.junit.platform.launcher.TestIdentifier;
import org.junit.platform.launcher.TestPlan;
import org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder;
import org.junit.platform.launcher.core.LauncherFactory;

import static org.junit.platform.engine.discovery.DiscoverySelectors.selectClass;
import static org.junit.platform.engine.TestExecutionResult.Status.SUCCESSFUL;

public class Tester {
  public static void main(String[] args) {
    File codesDirectory = null;
    try {
      String solutionCode = System.getenv("SOLUTION_CODE"), testCode = System.getenv("TEST_CODE");
      codesDirectory = createCodesDirectory(solutionCode, testCode);
      Map<String, Object> solutionInfo = getCodeInfo(solutionCode, "Solution", codesDirectory),
        testInfo = getCodeInfo(testCode, "Test", codesDirectory);
      String solutionCodePath = writeCodeToFile(codesDirectory, solutionInfo, solutionCode),
        testCodePath = writeCodeToFile(codesDirectory, testInfo, testCode);
      compileCodes(codesDirectory, solutionCodePath, testCodePath);
      List<ClassSelector> testClassSelectors = getClassSelectors(codesDirectory, testInfo);
      JSONArray testResults = executeTests(testClassSelectors);
      deleteDirectory(codesDirectory);
      System.out.print(testResults);
    } catch (Throwable throwable) {
      exit(255, codesDirectory);
    }
  }

  private static File createCodesDirectory(String solutionCode, String testCode) throws NoSuchAlgorithmException {
    File codesDirectory = new File(
      String.format("../codes/%s_%d", generateMD5(solutionCode + testCode), System.currentTimeMillis())
    );
    codesDirectory.mkdir();
    return codesDirectory;
  }

  private static String generateMD5(String text) throws NoSuchAlgorithmException {
    MessageDigest hasher = MessageDigest.getInstance("MD5");
    hasher.update(StandardCharsets.UTF_8.encode(text));
    return String.format("%032x", new BigInteger(1, hasher.digest()));
  }

  private static Map<String, Object> getCodeInfo(String code, String defaultFileName, File codesDirectory) {
    CompilationUnit unit = null;
    try {
      unit = StaticJavaParser.parse(code);
    }
    catch (ParseProblemException exception) {
      exit(1, codesDirectory);
    }
    return Map.of("fileName", getFileName(unit, defaultFileName), "typeNames", getTypeNames(unit));
  }

  private static void exit(int exitCode, File deletableDirectory) {
    if (deletableDirectory != null) {
      deleteDirectory(deletableDirectory);
    }
    System.exit(exitCode);
  }

  private static void deleteDirectory(File directory) {
    File[] contents = directory.listFiles();
    if (contents != null) {
      for (File file : contents) {
        deleteDirectory(file);
      }
    }
    directory.delete();
  }

  private static String getFileName(CompilationUnit unit, String defaultFileName) {
    Optional<TypeDeclaration<?>> publicType = unit.getTypes().stream()
      .filter(TypeDeclaration::isPublic).findFirst();
    return publicType.isPresent() ? publicType.get().getName().asString() : defaultFileName;
  }

  private static String[] getTypeNames(CompilationUnit unit) {
    Optional<PackageDeclaration> unitPackage = unit.getPackageDeclaration();
    String packagePrefix = !unitPackage.isPresent() ? ""
      : String.format("%s.", unitPackage.get().getName().asString());
    return unit.getTypes().stream()
      .map(type -> packagePrefix + type.getName().asString()).toArray(String[]::new);
  }

  private static String writeCodeToFile(File codesDirectory, Map<String, Object> codeInfo, String code)
  throws FileNotFoundException, UnsupportedEncodingException {
    String codePath = String.format("%s/%s.java", codesDirectory.getPath(), (String) codeInfo.get("fileName"));
    new PrintWriter(codePath, "UTF-8").append(code).close();
    return codePath;
  }

  private static void compileCodes(File codesDirectory, String solutionCodePath, String testCodePath)
  throws IOException {
    JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
    StandardJavaFileManager fileManager = compiler.getStandardFileManager(null, null, null);
    boolean success = compiler.getTask(null, fileManager,
      null, List.of("-cp", "junit.jar", "-d", codesDirectory.getPath()),
      null, fileManager.getJavaFileObjects(solutionCodePath, testCodePath)
    ).call();
    fileManager.close();
    if (!success) {
      exit(2, codesDirectory);
    }
  }

  private static List<ClassSelector> getClassSelectors(File codesDirectory, Map<String, Object> codeInfo)
  throws ClassNotFoundException, MalformedURLException {
    ChildFirstURLClassLoader classLoader = new ChildFirstURLClassLoader(new URL[] { codesDirectory.toURI().toURL() });
    List<ClassSelector> classSelectors = new ArrayList<>();
    for (String typeName : (String[]) codeInfo.get("typeNames")) {
      classSelectors.add(selectClass(classLoader.loadClass(typeName)));
    }
    return classSelectors;
  }

  private static class ChildFirstURLClassLoader extends URLClassLoader {
    public ChildFirstURLClassLoader(URL[] urls) {
      super(urls);
    }

    @Override
    public Class<?> loadClass(String name) throws ClassNotFoundException {
      try {
        return findClass(name);
      } catch (ClassNotFoundException exception) {
        return super.loadClass(name);
      }
    }
  }

  private static JSONArray executeTests(List<ClassSelector> testClassSelectors) {
    Launcher launcher = LauncherFactory.create();
    JSONResultGeneratingListener listener = new JSONResultGeneratingListener();
    launcher.registerTestExecutionListeners(listener);
    launcher.execute(launcher.discover(new LauncherDiscoveryRequestBuilder()
      .selectors(testClassSelectors).build()
    ));
    return listener.getResults();
  }

  private static class JSONResultGeneratingListener implements TestExecutionListener {
    private TestPlan testPlan;
    private JSONArray results;

    public JSONArray getResults() {
      return results;
    }

    @Override
    public void testPlanExecutionStarted(TestPlan testPlan) {
      this.testPlan = testPlan;
      this.results = new JSONArray();
    }

    @Override
    public void executionFinished(TestIdentifier identifier, TestExecutionResult result) {
      if (identifier.isTest()) {
        addTestResult(identifier.getDisplayName(), result.getStatus() == SUCCESSFUL ? "pass" : "fail");
      }
    }

    private void addTestResult(String name, String status) {
      results.put(new JSONObject().put("name", name).put("status", status));
    }

    @Override
    public void executionSkipped(TestIdentifier identifier, String reason) {
      if (identifier.isTest()) {
        addTestResult(identifier.getDisplayName(), "skip");
      }
      if (identifier.isContainer()) {
        addContainerTestsSkipped(identifier);
      }
    }

    private void addContainerTestsSkipped(TestIdentifier identifier) {
      testPlan.getDescendants(identifier).stream()
        .filter(TestIdentifier::isTest)
        .forEach(subIdentifier -> addTestResult(subIdentifier.getDisplayName(), "skip"));
    }
  }
}
