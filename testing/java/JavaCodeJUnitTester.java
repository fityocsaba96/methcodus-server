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

public class JavaCodeJUnitTester {

  private String solutionCode, testCode;
  private File codesDirectory;
  private Map<String, Object> solutionInfo, testInfo;
  private String solutionCodePath, testCodePath;
  private List<ClassSelector> testClassSelectors;

  public JavaCodeJUnitTester() { }

  public JSONArray test(String solutionCode, String testCode)
  throws ClassNotFoundException, CompilationException, IOException, NoSuchAlgorithmException, SyntaxException {
    this.solutionCode = solutionCode;
    this.testCode = testCode;
    try {
      codesDirectory = createCodesDirectory();
      solutionInfo = getCodeInfo(solutionCode, "Solution");
      testInfo = getCodeInfo(testCode, "SolutionTest");
      solutionCodePath = writeCodeToFile(solutionInfo, solutionCode);
      testCodePath = writeCodeToFile(testInfo, testCode);
      compileCodes();
      testClassSelectors = getTestClassSelectors();
      return executeTests();
    } finally {
      if (codesDirectory != null) {
        deleteDirectory(codesDirectory);
      }
    }
  }

  private File createCodesDirectory() throws NoSuchAlgorithmException {
    File codesDirectory = new File(
      String.format("codes/%s_%d", generateMD5(solutionCode + testCode), System.currentTimeMillis())
    );
    codesDirectory.mkdir();
    return codesDirectory;
  }

  private String generateMD5(String text) throws NoSuchAlgorithmException {
    MessageDigest hasher = MessageDigest.getInstance("MD5");
    hasher.update(StandardCharsets.UTF_8.encode(text));
    return String.format("%032x", new BigInteger(1, hasher.digest()));
  }

  private Map<String, Object> getCodeInfo(String code, String defaultFileName)
  throws SyntaxException {
    CompilationUnit unit = null;
    try {
      unit = StaticJavaParser.parse(code);
    } catch (ParseProblemException exception) {
      throw new SyntaxException();
    }
    return Map.of("fileName", getFileName(unit, defaultFileName), "typeNames", getTypeNames(unit));
  }

  private String getFileName(CompilationUnit unit, String defaultFileName) {
    Optional<TypeDeclaration<?>> publicType = unit.getTypes().stream()
      .filter(TypeDeclaration::isPublic).findFirst();
    return publicType.isPresent() ? publicType.get().getName().asString() : defaultFileName;
  }

  private String[] getTypeNames(CompilationUnit unit) {
    Optional<PackageDeclaration> unitPackage = unit.getPackageDeclaration();
    String packagePrefix = !unitPackage.isPresent() ? ""
      : String.format("%s.", unitPackage.get().getName().asString());
    return unit.getTypes().stream()
      .map(type -> packagePrefix + type.getName().asString()).toArray(String[]::new);
  }

  private String writeCodeToFile(Map<String, Object> codeInfo, String code)
  throws FileNotFoundException, UnsupportedEncodingException {
    String codePath = String.format("%s/%s.java", codesDirectory.getPath(), (String) codeInfo.get("fileName"));
    new PrintWriter(codePath, "UTF-8").append(code).close();
    return codePath;
  }

  private void compileCodes()
  throws CompilationException, IOException {
    JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
    StandardJavaFileManager fileManager = compiler.getStandardFileManager(null, null, null);
    boolean success = compiler.getTask(null, fileManager,
      null, List.of("-cp", "junit.jar", "-d", codesDirectory.getPath()),
      null, fileManager.getJavaFileObjects(solutionCodePath, testCodePath)
    ).call();
    fileManager.close();
    if (!success) {
      throw new CompilationException();
    }
  }

  private List<ClassSelector> getTestClassSelectors()
  throws ClassNotFoundException, MalformedURLException {
    ChildFirstURLClassLoader classLoader = new ChildFirstURLClassLoader(new URL[] { codesDirectory.toURI().toURL() });
    List<ClassSelector> classSelectors = new ArrayList<>();
    for (String typeName : (String[]) testInfo.get("typeNames")) {
      classSelectors.add(selectClass(classLoader.loadClass(typeName)));
    }
    return classSelectors;
  }

  private class ChildFirstURLClassLoader extends URLClassLoader {

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

  private JSONArray executeTests() {
    Launcher launcher = LauncherFactory.create();
    JSONResultGeneratingListener listener = new JSONResultGeneratingListener();
    launcher.registerTestExecutionListeners(listener);
    launcher.execute(launcher.discover(new LauncherDiscoveryRequestBuilder()
      .selectors(testClassSelectors).build()
    ));
    return listener.getResults();
  }

  private class JSONResultGeneratingListener implements TestExecutionListener {

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

  private void deleteDirectory(File directory) {
    File[] contents = directory.listFiles();
    if (contents != null) {
      for (File file : contents) {
        deleteDirectory(file);
      }
    }
    directory.delete();
  }
}

class SyntaxException extends Exception { }
class CompilationException extends Exception { }
