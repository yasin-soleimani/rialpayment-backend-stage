export class categoryManage {
  private data = [
    { id: 100, name: 'کالای دیجیتال' },
    { id: 101, name: ' رستوران'},
    { id: 102, name: 'لوازم خانگی' },
    { id: 103, name: 'خودرو و لوازم' },
    { id: 104, name: 'مسافرتی و اقامتی' },
    { id: 105, name: 'فرهنگ و هنر' },
    { id: 106, name: 'پزشکی و زیبایی' },
    { id: 107, name: 'فروشگاه و هایپر' },
    { id: 108, name: 'ورزش و سرگرمی' },
    { id: 109, name: 'مادر و کودک' },
    { id: 110, name: 'خدمات' },
    { id: 111, name: 'ابزار و الکتریک' }
  ];

  async findCat(id): Promise<any>{
    const data = this.data.find( value =>  value.id == id);
    if ( !data ) return null;
    return data;
  }

}