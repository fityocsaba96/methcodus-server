export class AddPairProgrammingRequestDto {
  public readonly pairUserName: string;
  public readonly exerciseId: string;
  public readonly programmingLanguage: string;
  public readonly softwareDevelopmentMethod: string;
}

export class PairEditedCodeDto {
  public readonly action: any;
  public readonly codeEditorId: number;
}
