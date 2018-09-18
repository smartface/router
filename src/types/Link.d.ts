export interface Pressable {
  onPress(e: any);
}

export interface Link extends Pressable {
  new (to: string);
}
