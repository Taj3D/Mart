/**
 * Font Awesome 4.7.0 to Lucide React Icon Mapping
 *
 * This file provides a comprehensive mapping from Font Awesome 4.7.0 icon class names
 * (without the `fa-` prefix) to their Lucide React icon component names (as strings).
 *
 * Where there's no exact match, the closest visual/semantic equivalent is used.
 * Icons with no Lucide equivalent are mapped to "HelpCircle" as a fallback.
 */

// ============================================================
// Type Definitions
// ============================================================

/** Font Awesome icon name (without the `fa-` prefix) */
export type FontAwesomeIconName = string;

/** Union of all Lucide icon names used in this mapping */
export type LucideIconName =
  | 'AlertCircle'
  | 'AlertTriangle'
  | 'AlignCenter'
  | 'AlignJustify'
  | 'AlignLeft'
  | 'AlignRight'
  | 'Ambulance'
  | 'Anchor'
  | 'Archive'
  | 'AreaChart'
  | 'ArrowDown'
  | 'ArrowDown01'
  | 'ArrowDownAZ'
  | 'ArrowDownCircle'
  | 'ArrowDownNarrow'
  | 'ArrowLeft'
  | 'ArrowLeftCircle'
  | 'ArrowLeftRight'
  | 'ArrowRight'
  | 'ArrowRightCircle'
  | 'ArrowUp'
  | 'ArrowUp01'
  | 'ArrowUpDown'
  | 'ArrowUpCircle'
  | 'ArrowUpNarrow'
  | 'ArrowUpZA'
  | 'Asterisk'
  | 'Award'
  | 'Baby'
  | 'Ban'
  | 'Banknote'
  | 'BarChart3'
  | 'Barcode'
  | 'BatteryFull'
  | 'BatteryLow'
  | 'BatteryMedium'
  | 'BatteryWarning'
  | 'Bed'
  | 'Beer'
  | 'Bell'
  | 'BellOff'
  | 'Bike'
  | 'Bitcoin'
  | 'Bold'
  | 'Book'
  | 'Bookmark'
  | 'Box'
  | 'Boxes'
  | 'Briefcase'
  | 'Bug'
  | 'Building2'
  | 'Bus'
  | 'Calculator'
  | 'Calendar'
  | 'CalendarCheck'
  | 'CalendarMinus'
  | 'CalendarPlus'
  | 'CalendarX'
  | 'Camera'
  | 'Car'
  | 'CartPlus'
  | 'Check'
  | 'CheckCircle'
  | 'CheckSquare'
  | 'ChevronDown'
  | 'ChevronLeft'
  | 'ChevronRight'
  | 'ChevronUp'
  | 'ChevronsDown'
  | 'ChevronsLeft'
  | 'ChevronsRight'
  | 'ChevronsUp'
  | 'Circle'
  | 'CircleDot'
  | 'Clipboard'
  | 'Clock'
  | 'Clone'
  | 'Cloud'
  | 'CloudDownload'
  | 'CloudUpload'
  | 'Code'
  | 'Coffee'
  | 'Columns'
  | 'Compass'
  | 'Copy'
  | 'Cpu'
  | 'CreditCard'
  | 'Crop'
  | 'Crosshair'
  | 'Database'
  | 'DollarSign'
  | 'Droplets'
  | 'Edit'
  | 'Edit2'
  | 'Eject'
  | 'Eraser'
  | 'Euro'
  | 'ExternalLink'
  | 'Eye'
  | 'EyeOff'
  | 'Factory'
  | 'FastForward'
  | 'File'
  | 'FileArchive'
  | 'FileAudio'
  | 'FileCode'
  | 'FileEdit'
  | 'FileImage'
  | 'FileSpreadsheet'
  | 'FileText'
  | 'FileVideo'
  | 'Filter'
  | 'Flag'
  | 'Flame'
  | 'Folder'
  | 'FolderOpen'
  | 'Gauge'
  | 'GitFork'
  | 'Gift'
  | 'Globe'
  | 'Group'
  | 'Hand'
  | 'Handshake'
  | 'HardDrive'
  | 'Header' // used for Heading fallback
  | 'Heading'
  | 'Headphones'
  | 'Heart'
  | 'HeartPulse'
  | 'HelpCircle'
  | 'History'
  | 'Home'
  | 'Hotel'
  | 'Hourglass'
  | 'IndianRupee'
  | 'IndentDecrease'
  | 'IndentIncrease'
  | 'Info'
  | 'Italic'
  | 'JapaneseYen'
  | 'Key'
  | 'Keyboard'
  | 'KoreanWon'
  | 'LayoutDashboard'
  | 'LayoutGrid'
  | 'Laptop'
  | 'Leaf'
  | 'Lemon'
  | 'Link'
  | 'LineChart'
  | 'List'
  | 'ListOrdered'
  | 'ListTodo'
  | 'Loader'
  | 'Loader2'
  | 'Lock'
  | 'LogIn'
  | 'LogOut'
  | 'Mail'
  | 'MailOpen'
  | 'Map'
  | 'MapPin'
  | 'Maximize'
  | 'Maximize2'
  | 'Megaphone'
  | 'Menu'
  | 'MessageCircle'
  | 'MessagesSquare'
  | 'Mic'
  | 'MicOff'
  | 'Minimize2'
  | 'Minus'
  | 'MinusCircle'
  | 'MinusSquare'
  | 'Monitor'
  | 'Moon'
  | 'MousePointer'
  | 'Move'
  | 'MoveHorizontal'
  | 'MoveVertical'
  | 'Music'
  | 'Navigation'
  | 'Network'
  | 'Newspaper'
  | 'Paintbrush'
  | 'Paperclip'
  | 'Paragraph'
  | 'Pause'
  | 'PauseCircle'
  | 'Percent'
  | 'Phone'
  | 'Photo' // used for Image fallback
  | 'PieChart'
  | 'Pin'
  | 'Pipette'
  | 'Plane'
  | 'Play'
  | 'PlayCircle'
  | 'Plus'
  | 'PlusCircle'
  | 'PlusSquare'
  | 'Plug'
  | 'Pointer'
  | 'PoundSterling'
  | 'Power'
  | 'Printer'
  | 'Puzzle'
  | 'QrCode'
  | 'Receipt'
  | 'Recycle'
  | 'RefreshCw'
  | 'Reply'
  | 'ReplyAll'
  | 'Rewind'
  | 'Rocket'
  | 'RotateCcw'
  | 'RotateCw'
  | 'Rss'
  | 'RussianRuble'
  | 'Scale'
  | 'ScanEye'
  | 'Scissors'
  | 'Search'
  | 'Send'
  | 'Server'
  | 'Settings'
  | 'Share'
  | 'Share2'
  | 'Shield'
  | 'Ship'
  | 'ShoppingBag'
  | 'ShoppingBasket'
  | 'ShoppingCart'
  | 'Signal'
  | 'Signpost'
  | 'SkipBack'
  | 'SkipForward'
  | 'SlidersHorizontal'
  | 'Smartphone'
  | 'Snowflake'
  | 'Square'
  | 'Star'
  | 'StarHalf'
  | 'Stethoscope'
  | 'StickyNote'
  | 'StopCircle'
  | 'Store'
  | 'Strikethrough'
  | 'Subscript'
  | 'Sun'
  | 'SunMoon'
  | 'Superscript'
  | 'Table'
  | 'Tablet'
  | 'Tag'
  | 'Tags'
  | 'Terminal'
  | 'Thermometer'
  | 'Timer'
  | 'Trash2'
  | 'Tree'
  | 'Train'
  | 'Trophy'
  | 'Truck'
  | 'Type'
  | 'Umbrella'
  | 'Underline'
  | 'Undo'
  | 'Ungroup'
  | 'University'
  | 'Unlock'
  | 'Unlink'
  | 'Usb'
  | 'User'
  | 'UserCircle'
  | 'UserMinus'
  | 'UserPlus'
  | 'UserX'
  | 'Users'
  | 'Video'
  | 'Volume1'
  | 'Volume2'
  | 'VolumeX'
  | 'Wallet'
  | 'Wand2'
  | 'Wine'
  | 'Wrench'
  | 'X'
  | 'XCircle';

// ============================================================
// FA 4.7.0 → Lucide Icon Mapping
// ============================================================

export const faToLucideMap: Record<string, LucideIconName> = {
  // ----------------------------------------------------------
  // Navigation & UI
  // ----------------------------------------------------------
  search: 'Search',
  home: 'Home',
  bars: 'Menu',
  navicon: 'Menu',
  reorder: 'Menu',
  close: 'X',
  remove: 'X',
  times: 'X',
  'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight',
  'chevron-up': 'ChevronUp',
  'chevron-down': 'ChevronDown',
  'chevron-circle-left': 'ChevronLeft',
  'chevron-circle-right': 'ChevronRight',
  'chevron-circle-up': 'ChevronUp',
  'chevron-circle-down': 'ChevronDown',
  'angle-left': 'ChevronLeft',
  'angle-right': 'ChevronRight',
  'angle-up': 'ChevronUp',
  'angle-down': 'ChevronDown',
  'angle-double-left': 'ChevronsLeft',
  'angle-double-right': 'ChevronsRight',
  'angle-double-up': 'ChevronsUp',
  'angle-double-down': 'ChevronsDown',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'arrow-up': 'ArrowUp',
  'arrow-down': 'ArrowDown',
  'arrow-circle-left': 'ArrowLeftCircle',
  'arrow-circle-right': 'ArrowRightCircle',
  'arrow-circle-up': 'ArrowUpCircle',
  'arrow-circle-down': 'ArrowDownCircle',
  'arrow-circle-o-left': 'ArrowLeftCircle',
  'arrow-circle-o-right': 'ArrowRightCircle',
  'arrow-circle-o-up': 'ArrowUpCircle',
  'arrow-circle-o-down': 'ArrowDownCircle',
  expand: 'Maximize2',
  compress: 'Minimize2',
  arrows: 'Move',
  'arrows-alt': 'Maximize',
  'arrows-v': 'MoveVertical',
  'arrows-h': 'MoveHorizontal',
  'long-arrow-left': 'ArrowLeft',
  'long-arrow-right': 'ArrowRight',
  'long-arrow-up': 'ArrowUp',
  'long-arrow-down': 'ArrowDown',
  'location-arrow': 'Navigation',
  'expand-arrows-alt': 'Maximize',
  exchange: 'ArrowLeftRight',
  'caret-left': 'ChevronLeft',
  'caret-right': 'ChevronRight',
  'caret-up': 'ChevronUp',
  'caret-down': 'ChevronDown',
  'caret-square-o-left': 'ChevronLeft',
  'caret-square-o-right': 'ChevronRight',
  'caret-square-o-up': 'ChevronUp',
  'caret-square-o-down': 'ChevronDown',
  'caret-square-left': 'ChevronLeft',
  'caret-square-right': 'ChevronRight',
  'caret-square-up': 'ChevronUp',
  'caret-square-down': 'ChevronDown',
  'toggle-left': 'ChevronLeft',
  'toggle-right': 'ChevronRight',
  'toggle-on': 'ChevronRight',
  'toggle-off': 'ChevronLeft',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'arrow-up': 'ArrowUp',
  'arrow-down': 'ArrowDown',
  'hand-o-left': 'ArrowLeft',
  'hand-o-right': 'ArrowRight',
  'hand-o-up': 'ArrowUp',
  'hand-o-down': 'ArrowDown',
  'level-up': 'ArrowUp',
  'level-down': 'ArrowDown',
  'sort-amount-asc': 'ArrowDownNarrow',
  'sort-amount-desc': 'ArrowUpNarrow',

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------
  plus: 'Plus',
  'plus-circle': 'PlusCircle',
  minus: 'Minus',
  'minus-circle': 'MinusCircle',
  'times-circle': 'XCircle',
  'times-circle-o': 'XCircle',
  check: 'Check',
  'check-circle': 'CheckCircle',
  'check-circle-o': 'CheckCircle',
  'check-square': 'CheckSquare',
  'check-square-o': 'CheckSquare',
  square: 'Square',
  'square-o': 'Square',
  edit: 'Edit2',
  pencil: 'Edit2',
  'pencil-square-o': 'Edit',
  'pencil-square': 'FileEdit',
  trash: 'Trash2',
  'trash-o': 'Trash2',
  save: 'Save',
  'floppy-o': 'Save',
  download: 'Download',
  upload: 'Upload',
  'cloud-download': 'CloudDownload',
  'cloud-upload': 'CloudUpload',
  refresh: 'RefreshCw',
  repeat: 'Repeat2', // deliberate override below; keep both entries
  'rotate-right': 'RotateCw',
  'rotate-left': 'RotateCcw',
  undo: 'Undo',
  retweet: 'Repeat2',
  share: 'Share2',
  'share-alt': 'Share',
  'share-square': 'Share2',
  'share-square-o': 'Share2',
  send: 'Send',
  'paper-plane': 'Send',
  'send-o': 'Send',
  'paper-plane-o': 'Send',
  copy: 'Copy',
  'files-o': 'Copy',
  cut: 'Scissors',
  scissors: 'Scissors',
  paste: 'Clipboard',
  clipboard: 'Clipboard',
  filter: 'Filter',
  sort: 'ArrowUpDown',
  unsorted: 'ArrowUpDown',
  'sort-up': 'ArrowUp',
  'sort-asc': 'ArrowUp',
  'sort-down': 'ArrowDown',
  'sort-desc': 'ArrowDown',
  'sort-alpha-asc': 'ArrowDownAZ',
  'sort-alpha-desc': 'ArrowUpZA',
  'sort-numeric-asc': 'ArrowDown01',
  'sort-numeric-desc': 'ArrowUp01',
  print: 'Printer',
  'power-off': 'Power',
  'sign-in': 'LogIn',
  'sign-out': 'LogOut',
  'sign-language': 'Hand',
  signing: 'Hand',
  lock: 'Lock',
  unlock: 'Unlock',
  'unlock-alt': 'Unlock',
  eye: 'Eye',
  'eye-slash': 'EyeOff',
  flag: 'Flag',
  'flag-o': 'Flag',
  'flag-checkered': 'Flag',
  ban: 'Ban',
  eraser: 'Eraser',
  'circle-o-notch': 'Loader',

  // ----------------------------------------------------------
  // Status & Indicators
  // ----------------------------------------------------------
  info: 'Info',
  'info-circle': 'Info',
  exclamation: 'AlertTriangle',
  'exclamation-circle': 'AlertCircle',
  'exclamation-triangle': 'AlertTriangle',
  warning: 'AlertTriangle',
  question: 'HelpCircle',
  'question-circle': 'HelpCircle',
  'question-circle-o': 'HelpCircle',
  spinner: 'Loader2',
  'circle-thin': 'Circle',
  circle: 'Circle',
  'circle-o': 'Circle',
  'dot-circle-o': 'CircleDot',
  shield: 'Shield',
  star: 'Star',
  'star-o': 'Star',
  'star-half': 'StarHalf',
  'star-half-o': 'StarHalf',
  heart: 'Heart',
  'heart-o': 'Heart',
  'thumbs-up': 'ThumbsUp',
  'thumbs-down': 'ThumbsDown',
  'thumbs-o-up': 'ThumbsUp',
  'thumbs-o-down': 'ThumbsDown',
  trophy: 'Trophy',
  certificate: 'Award',
  bolt: 'Zap',
  flash: 'Zap',
  fire: 'Flame',
  signal: 'Signal',
  wifi: 'Wifi',
  'hashtag': 'Hash', // Lucide doesn't have Hash in common set; use HelpCircle
  'low-vision': 'EyeOff',
  'deaf': 'EarOff', // fallback
  'blind': 'EyeOff',

  // ----------------------------------------------------------
  // Objects & Documents
  // ----------------------------------------------------------
  file: 'File',
  'file-o': 'File',
  'file-text': 'FileText',
  'file-text-o': 'FileText',
  'file-pdf-o': 'FileText',
  'file-word-o': 'FileText',
  'file-excel-o': 'FileSpreadsheet',
  'file-powerpoint-o': 'FileText',
  'file-image-o': 'FileImage',
  'file-photo-o': 'FileImage',
  'file-picture-o': 'FileImage',
  'file-archive-o': 'FileArchive',
  'file-zip-o': 'FileArchive',
  'file-audio-o': 'FileAudio',
  'file-sound-o': 'FileAudio',
  'file-video-o': 'FileVideo',
  'file-movie-o': 'FileVideo',
  'file-code-o': 'FileCode',
  folder: 'Folder',
  'folder-o': 'Folder',
  'folder-open': 'FolderOpen',
  'folder-open-o': 'FolderOpen',
  book: 'Book',
  bookmark: 'Bookmark',
  'bookmark-o': 'Bookmark',
  'newspaper-o': 'Newspaper',
  list: 'List',
  'list-alt': 'ListOrdered',
  'list-ul': 'List',
  'list-ol': 'ListOrdered',
  th: 'LayoutGrid',
  'th-large': 'LayoutGrid',
  'th-list': 'List',
  table: 'Table',
  columns: 'Columns',
  database: 'Database',
  server: 'Server',
  archive: 'Archive',
  'hdd-o': 'HardDrive',
  key: 'Key',
  code: 'Code',
  'code-fork': 'GitFork',
  terminal: 'Terminal',
  bug: 'Bug',
  cog: 'Settings',
  gear: 'Settings',
  cogs: 'Settings',
  gears: 'Settings',
  sliders: 'SlidersHorizontal',
  wrench: 'Wrench',
  tasks: 'ListTodo',
  briefcase: 'Briefcase',
  suitcase: 'Briefcase',
  legal: 'Scale',
  gavel: 'Scale',
  'balance-scale': 'Scale',
  'puzzle-piece': 'Puzzle',

  // ----------------------------------------------------------
  // Communication
  // ----------------------------------------------------------
  envelope: 'Mail',
  'envelope-o': 'Mail',
  'envelope-square': 'Mail',
  'envelope-open': 'MailOpen',
  'envelope-open-o': 'MailOpen',
  comment: 'MessageCircle',
  'comment-o': 'MessageCircle',
  comments: 'MessagesSquare',
  'comments-o': 'MessagesSquare',
  commenting: 'MessageCircle',
  'commenting-o': 'MessageCircle',
  reply: 'Reply',
  'mail-reply': 'Reply',
  'reply-all': 'ReplyAll',
  'mail-reply-all': 'ReplyAll',
  phone: 'Phone',
  'phone-square': 'Phone',
  fax: 'Printer',
  bell: 'Bell',
  'bell-o': 'Bell',
  'bell-slash': 'BellOff',
  'bell-slash-o': 'BellOff',
  rss: 'Rss',
  feed: 'Rss',
  'rss-square': 'Rss',
  bullhorn: 'Megaphone',
  'at': 'AtSign', // Lucide has AtSign
  'mail-forward': 'Share2',

  // ----------------------------------------------------------
  // Users & People
  // ----------------------------------------------------------
  user: 'User',
  'user-o': 'User',
  'user-plus': 'UserPlus',
  'user-times': 'UserMinus',
  'user-secret': 'UserX',
  'user-circle': 'UserCircle',
  'user-circle-o': 'UserCircle',
  users: 'Users',
  group: 'Users',
  female: 'User',
  male: 'User',
  child: 'Baby',
  'handshake-o': 'Handshake',
  'address-book': 'Contact', // Lucide Contact
  'address-book-o': 'Contact',
  'address-card': 'Contact',
  'address-card-o': 'Contact',
  'id-badge': 'BadgeCheck', // fallback
  'id-card': 'CreditCard', // closest visual
  'id-card-o': 'CreditCard',

  // ----------------------------------------------------------
  // Commerce & Finance
  // ----------------------------------------------------------
  'shopping-cart': 'ShoppingCart',
  'shopping-bag': 'ShoppingBag',
  'shopping-basket': 'ShoppingBasket',
  'credit-card': 'CreditCard',
  'credit-card-alt': 'CreditCard',
  money: 'Banknote',
  dollar: 'DollarSign',
  usd: 'DollarSign',
  euro: 'Euro',
  eur: 'Euro',
  gbp: 'PoundSterling',
  rupee: 'IndianRupee',
  inr: 'IndianRupee',
  yen: 'JapaneseYen',
  jpy: 'JapaneseYen',
  cny: 'JapaneseYen',
  rmb: 'JapaneseYen',
  ruble: 'RussianRuble',
  rub: 'RussianRuble',
  rouble: 'RussianRuble',
  won: 'KoreanWon',
  krw: 'KoreanWon',
  bitcoin: 'Bitcoin',
  btc: 'Bitcoin',
  calculator: 'Calculator',
  'chart-bar': 'BarChart3',
  'bar-chart': 'BarChart3',
  'bar-chart-o': 'BarChart3',
  'area-chart': 'AreaChart',
  'pie-chart': 'PieChart',
  'line-chart': 'LineChart',
  receipt: 'Receipt',
  wallet: 'Wallet',
  percent: 'Percent',
  tag: 'Tag',
  tags: 'Tags',
  barcode: 'Barcode',
  qrcode: 'QrCode',
  gift: 'Gift',
  'cart-plus': 'CartPlus',
  'cart-arrow-down': 'ShoppingCart',
  'bank': 'University',
  'money-bill': 'Banknote',
  'money-bill-wave': 'Banknote',

  // ----------------------------------------------------------
  // Media
  // ----------------------------------------------------------
  camera: 'Camera',
  'camera-retro': 'Camera',
  image: 'Image', // Note: 'Image' is a valid Lucide icon
  photo: 'Image',
  'picture-o': 'Image',
  'video-camera': 'Video',
  play: 'Play',
  pause: 'Pause',
  stop: 'Square',
  forward: 'FastForward',
  'fast-forward': 'FastForward',
  backward: 'Rewind',
  'fast-backward': 'Rewind',
  'step-forward': 'SkipForward',
  'step-backward': 'SkipBack',
  eject: 'Eject',
  'play-circle': 'PlayCircle',
  'play-circle-o': 'PlayCircle',
  'pause-circle': 'PauseCircle',
  'pause-circle-o': 'PauseCircle',
  'stop-circle': 'StopCircle',
  'stop-circle-o': 'StopCircle',
  'volume-off': 'VolumeX',
  'volume-down': 'Volume1',
  'volume-up': 'Volume2',
  headphones: 'Headphones',
  music: 'Music',
  microphone: 'Mic',
  'microphone-slash': 'MicOff',
  'film': 'Film', // Lucide Film
  'slideshare': 'Presentation', // fallback
  'youtube-play': 'Play',
  'photo': 'Image',

  // ----------------------------------------------------------
  // Buildings & Places
  // ----------------------------------------------------------
  building: 'Building2',
  'building-o': 'Building2',
  'hospital-o': 'Hospital',
  university: 'University',
  institution: 'University',
  hotel: 'Hotel',
  bed: 'Bed',
  store: 'Store',
  shop: 'Store',
  'industry': 'Factory',
  'fort-awesome': 'Castle', // fallback

  // ----------------------------------------------------------
  // Transportation
  // ----------------------------------------------------------
  car: 'Car',
  automobile: 'Car',
  taxi: 'Car',
  cab: 'Car',
  bus: 'Bus',
  truck: 'Truck',
  ship: 'Ship',
  plane: 'Plane',
  rocket: 'Rocket',
  bicycle: 'Bike',
  motorcycle: 'Bike',
  train: 'Train',
  subway: 'Train',
  'plane-departure': 'Plane',
  'plane-arrival': 'Plane',
  'ship': 'Ship',

  // ----------------------------------------------------------
  // Weather & Nature
  // ----------------------------------------------------------
  'sun-o': 'Sun',
  'moon-o': 'Moon',
  cloud: 'Cloud',
  umbrella: 'Umbrella',
  leaf: 'Leaf',
  tree: 'Tree',
  'snowflake-o': 'Snowflake',
  tint: 'Droplets',
  adjust: 'SunMoon',
  'cloud-download': 'CloudDownload',
  'cloud-upload': 'CloudUpload',
  'bolt': 'Zap',
  'thunderstorm': 'CloudLightning', // fallback to HelpCircle

  // ----------------------------------------------------------
  // Date & Time
  // ----------------------------------------------------------
  calendar: 'Calendar',
  'calendar-o': 'Calendar',
  'calendar-plus-o': 'CalendarPlus',
  'calendar-minus-o': 'CalendarMinus',
  'calendar-times-o': 'CalendarX',
  'calendar-check-o': 'CalendarCheck',
  'clock-o': 'Clock',
  history: 'History',
  'hourglass-o': 'Hourglass',
  'hourglass-start': 'Hourglass',
  'hourglass-half': 'Hourglass',
  'hourglass-end': 'Hourglass',
  hourglass: 'Hourglass',
  stopwatch: 'Timer',

  // ----------------------------------------------------------
  // Editing & Formatting
  // ----------------------------------------------------------
  font: 'Type',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  'text-height': 'MoveVertical',
  'text-width': 'MoveHorizontal',
  'align-left': 'AlignLeft',
  'align-center': 'AlignCenter',
  'align-right': 'AlignRight',
  'align-justify': 'AlignJustify',
  indent: 'IndentIncrease',
  outdent: 'IndentDecrease',
  dedent: 'IndentDecrease',
  link: 'Link',
  chain: 'Link',
  unlink: 'Unlink',
  'chain-broken': 'Unlink',
  header: 'Heading',
  paragraph: 'Paragraph',
  superscript: 'Superscript',
  subscript: 'Subscript',
  magic: 'Wand2',

  // ----------------------------------------------------------
  // Maps & Location
  // ----------------------------------------------------------
  map: 'Map',
  'map-o': 'Map',
  'map-marker': 'MapPin',
  'map-pin': 'MapPin',
  'map-signs': 'Signpost',
  globe: 'Globe',
  compass: 'Compass',
  crosshairs: 'Crosshair',
  'street-view': 'ScanEye',
  'location-arrow': 'Navigation',
  'map-marker-alt': 'MapPin',

  // ----------------------------------------------------------
  // Medical
  // ----------------------------------------------------------
  heartbeat: 'HeartPulse',
  stethoscope: 'Stethoscope',
  medkit: 'HelpCircle', // no direct Lucide equivalent
  ambulance: 'Ambulance',
  'user-md': 'Stethoscope',
  thermometer: 'Thermometer',
  'thermometer-full': 'Thermometer',
  'thermometer-three-quarters': 'Thermometer',
  'thermometer-half': 'Thermometer',
  'thermometer-quarter': 'Thermometer',
  'thermometer-empty': 'Thermometer',

  // ----------------------------------------------------------
  // Devices
  // ----------------------------------------------------------
  desktop: 'Monitor',
  laptop: 'Laptop',
  tablet: 'Tablet',
  mobile: 'Smartphone',
  'mobile-phone': 'Smartphone',
  'keyboard-o': 'Keyboard',
  'mouse-pointer': 'MousePointer',
  gamepad: 'Gamepad2',
  'tv': 'Tv', // Lucide Tv
  'print': 'Printer',

  // ----------------------------------------------------------
  // Other Common
  // ----------------------------------------------------------
  glass: 'Wine',
  beer: 'Beer',
  coffee: 'Coffee',
  cutlery: 'Utensils', // Lucide Utensils
  spoon: 'Utensils', // fallback
  'lemon-o': 'Lemon',
  'lightbulb-o': 'Lightbulb',
  anchor: 'Anchor',
  asterisk: 'Asterisk',
  'plus-square': 'PlusSquare',
  'plus-square-o': 'PlusSquare',
  'minus-square': 'MinusSquare',
  'minus-square-o': 'MinusSquare',
  'external-link': 'ExternalLink',
  'external-link-square': 'ExternalLink',
  paperclip: 'Paperclip',
  'thumb-tack': 'Pin',
  pushpin: 'Pin',
  sitemap: 'Network',
  maxcdn: 'Gauge',
  dashboard: 'LayoutDashboard',
  tachometer: 'Gauge',
  'battery-full': 'BatteryFull',
  'battery-three-quarters': 'BatteryMedium',
  'battery-half': 'BatteryMedium',
  'battery-quarter': 'BatteryLow',
  'battery-empty': 'BatteryWarning',
  plug: 'Plug',
  usb: 'Usb',
  microchip: 'Cpu',
  'paint-brush': 'Paintbrush',
  eyedropper: 'Pipette',
  crop: 'Crop',
  'object-group': 'Group',
  'object-ungroup': 'Ungroup',
  clone: 'Clone',
  'window-maximize': 'Maximize2',
  'window-minimize': 'Minus',
  'window-restore': 'Copy',
  'window-close': 'X',
  'window-close-o': 'X',
  'sticky-note': 'StickyNote',
  'sticky-note-o': 'StickyNote',
  cubes: 'Boxes',
  cube: 'Box',
  recycle: 'Recycle',
  'hand-paper-o': 'Hand',
  'hand-rock-o': 'Hand',
  'hand-pointer-o': 'Pointer',
  'hand-scissors-o': 'Scissors',
  'hand-spock-o': 'Hand',
  'hand-peace-o': 'Hand',
  'hand-lizard-o': 'Hand',
  'hand-o-up': 'Pointer',
  'hand-o-down': 'Pointer',
  'hand-o-left': 'Pointer',
  'hand-o-right': 'Pointer',

  // ----------------------------------------------------------
  // Accessibility & Miscellaneous
  // ----------------------------------------------------------
  'wheelchair': 'Accessibility', // fallback to HelpCircle
  'wheelchair-alt': 'Accessibility', // fallback
  'braille': 'EyeOff', // fallback
  'audio-description': 'Volume2', // fallback
  'volume-control-phone': 'Phone', // fallback

  // ----------------------------------------------------------
  // Brands (common ones that might be used as generic icons)
  // ----------------------------------------------------------
  'android': 'Smartphone', // fallback
  'apple': 'Smartphone', // fallback
  'windows': 'Monitor', // fallback
  'linux': 'Terminal', // fallback
  'github': 'Github', // Lucide has Github
  'gitlab': 'Gitlab', // Lucide has Gitlab
  'bitbucket': 'HelpCircle', // no equivalent
  'google': 'Search', // fallback
  'facebook': 'Facebook', // Lucide has Facebook
  'twitter': 'Twitter', // Lucide has Twitter
  'linkedin': 'Linkedin', // Lucide has Linkedin
  'youtube': 'Youtube', // Lucide has Youtube
  'instagram': 'Instagram', // Lucide has Instagram
  'pinterest': 'HelpCircle',
  'reddit': 'HelpCircle',
  'slack': 'Hash', // fallback
  'trello': 'Trello', // Lucide has Trello
  'wordpress': 'HelpCircle',
  'dropbox': 'HelpCircle',
  'stack-overflow': 'HelpCircle',

  // ----------------------------------------------------------
  // Additional FA 4.7.0 Icons
  // ----------------------------------------------------------
  'adn': 'User',
  'align-center': 'AlignCenter',
  'align-justify': 'AlignJustify',
  'align-left': 'AlignLeft',
  'align-right': 'AlignRight',
  'amazon': 'ShoppingCart',
  'ambulance': 'Ambulance',
  'anchor': 'Anchor',
  'angle-double-down': 'ChevronsDown',
  'angle-double-left': 'ChevronsLeft',
  'angle-double-right': 'ChevronsRight',
  'angle-double-up': 'ChevronsUp',
  'angle-down': 'ChevronDown',
  'angle-left': 'ChevronLeft',
  'angle-right': 'ChevronRight',
  'angle-up': 'ChevronUp',
  'arrow-circle-down': 'ArrowDownCircle',
  'arrow-circle-left': 'ArrowLeftCircle',
  'arrow-circle-right': 'ArrowRightCircle',
  'arrow-circle-up': 'ArrowUpCircle',
  'arrow-down': 'ArrowDown',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'arrow-up': 'ArrowUp',
  'arrows': 'Move',
  'arrows-alt': 'Maximize',
  'arrows-h': 'MoveHorizontal',
  'arrows-v': 'MoveVertical',
  'asterisk': 'Asterisk',
  'at': 'AtSign',
  'backward': 'Rewind',
  'ban': 'Ban',
  'bar-chart': 'BarChart3',
  'barcode': 'Barcode',
  'bath': 'Bath', // fallback to HelpCircle
  'battery-empty': 'BatteryWarning',
  'battery-full': 'BatteryFull',
  'battery-half': 'BatteryMedium',
  'battery-quarter': 'BatteryLow',
  'battery-three-quarters': 'BatteryMedium',
  'bed': 'Bed',
  'beer': 'Beer',
  'bell': 'Bell',
  'bell-o': 'Bell',
  'bell-slash': 'BellOff',
  'bell-slash-o': 'BellOff',
  'bicycle': 'Bike',
  'bitcoin': 'Bitcoin',
  'bold': 'Bold',
  'bolt': 'Zap',
  'bomb': 'AlertTriangle', // closest semantic match
  'book': 'Book',
  'bookmark': 'Bookmark',
  'bookmark-o': 'Bookmark',
  'briefcase': 'Briefcase',
  'bug': 'Bug',
  'building': 'Building2',
  'building-o': 'Building2',
  'bullhorn': 'Megaphone',
  'bullseye': 'Target', // fallback to Crosshair
  'bus': 'Bus',
  'calculator': 'Calculator',
  'calendar': 'Calendar',
  'calendar-check-o': 'CalendarCheck',
  'calendar-minus-o': 'CalendarMinus',
  'calendar-o': 'Calendar',
  'calendar-plus-o': 'CalendarPlus',
  'calendar-times-o': 'CalendarX',
  'camera': 'Camera',
  'camera-retro': 'Camera',
  'car': 'Car',
  'caret-down': 'ChevronDown',
  'caret-left': 'ChevronLeft',
  'caret-right': 'ChevronRight',
  'caret-up': 'ChevronUp',
  'cart-arrow-down': 'ShoppingCart',
  'cart-plus': 'CartPlus',
  'cc': 'CreditCard', // closest
  'certificate': 'Award',
  'check': 'Check',
  'check-circle': 'CheckCircle',
  'check-circle-o': 'CheckCircle',
  'check-square': 'CheckSquare',
  'check-square-o': 'CheckSquare',
  'chevron-circle-down': 'ChevronDown',
  'chevron-circle-left': 'ChevronLeft',
  'chevron-circle-right': 'ChevronRight',
  'chevron-circle-up': 'ChevronUp',
  'chevron-down': 'ChevronDown',
  'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight',
  'chevron-up': 'ChevronUp',
  'child': 'Baby',
  'circle': 'Circle',
  'circle-o': 'Circle',
  'circle-o-notch': 'Loader',
  'circle-thin': 'Circle',
  'clipboard': 'Clipboard',
  'clock-o': 'Clock',
  'clone': 'Clone',
  'close': 'X',
  'cloud': 'Cloud',
  'cloud-download': 'CloudDownload',
  'cloud-upload': 'CloudUpload',
  'code': 'Code',
  'code-fork': 'GitFork',
  'coffee': 'Coffee',
  'cog': 'Settings',
  'cogs': 'Settings',
  'columns': 'Columns',
  'comment': 'MessageCircle',
  'comment-o': 'MessageCircle',
  'comments': 'MessagesSquare',
  'comments-o': 'MessagesSquare',
  'compass': 'Compass',
  'compress': 'Minimize2',
  'copy': 'Copy',
  'credit-card': 'CreditCard',
  'credit-card-alt': 'CreditCard',
  'crop': 'Crop',
  'crosshairs': 'Crosshair',
  'css3': 'Code',
  'cube': 'Box',
  'cubes': 'Boxes',
  'cut': 'Scissors',
  'cutlery': 'Utensils',
  'database': 'Database',
  'dashboard': 'LayoutDashboard',
  'dedent': 'IndentDecrease',
  'desktop': 'Monitor',
  'diamond': 'Diamond', // fallback to HelpCircle
  'dot-circle-o': 'CircleDot',
  'download': 'Download',
  'dribbble': 'HelpCircle',
  'dropbox': 'HelpCircle',
  'edit': 'Edit2',
  'eject': 'Eject',
  'ellipsis-h': 'MoreHorizontal', // Lucide has this
  'ellipsis-v': 'MoreVertical', // Lucide has this
  'envelope': 'Mail',
  'envelope-o': 'Mail',
  'envelope-open': 'MailOpen',
  'envelope-open-o': 'MailOpen',
  'envelope-square': 'Mail',
  'eraser': 'Eraser',
  'eur': 'Euro',
  'euro': 'Euro',
  'exchange': 'ArrowLeftRight',
  'exclamation': 'AlertTriangle',
  'exclamation-circle': 'AlertCircle',
  'exclamation-triangle': 'AlertTriangle',
  'expand': 'Maximize2',
  'expand-arrows-alt': 'Maximize',
  'external-link': 'ExternalLink',
  'external-link-square': 'ExternalLink',
  'eye': 'Eye',
  'eye-slash': 'EyeOff',
  'eyedropper': 'Pipette',
  'facebook': 'Facebook',
  'fast-backward': 'Rewind',
  'fast-forward': 'FastForward',
  'fax': 'Printer',
  'feed': 'Rss',
  'female': 'User',
  'file': 'File',
  'file-archive-o': 'FileArchive',
  'file-audio-o': 'FileAudio',
  'file-code-o': 'FileCode',
  'file-excel-o': 'FileSpreadsheet',
  'file-image-o': 'FileImage',
  'file-movie-o': 'FileVideo',
  'file-o': 'File',
  'file-pdf-o': 'FileText',
  'file-photo-o': 'FileImage',
  'file-picture-o': 'FileImage',
  'file-powerpoint-o': 'FileText',
  'file-sound-o': 'FileAudio',
  'file-text': 'FileText',
  'file-text-o': 'FileText',
  'file-video-o': 'FileVideo',
  'file-word-o': 'FileText',
  'file-zip-o': 'FileArchive',
  'files-o': 'Copy',
  'film': 'Film',
  'filter': 'Filter',
  'fire': 'Flame',
  'flag': 'Flag',
  'flag-checkered': 'Flag',
  'flag-o': 'Flag',
  'flash': 'Zap',
  'flask': 'FlaskConical', // fallback to Beaker/HelpCircle
  'floppy-o': 'Save',
  'folder': 'Folder',
  'folder-o': 'Folder',
  'folder-open': 'FolderOpen',
  'folder-open-o': 'FolderOpen',
  'font': 'Type',
  'forward': 'FastForward',
  'foursquare': 'MapPin', // fallback
  'frown-o': 'Frown', // Lucide Frown
  'gamepad': 'Gamepad2',
  'gavel': 'Scale',
  'gbp': 'PoundSterling',
  'gear': 'Settings',
  'gears': 'Settings',
  'gift': 'Gift',
  'git': 'GitBranch', // Lucide has GitBranch
  'github': 'Github',
  'gitlab': 'Gitlab',
  'globe': 'Globe',
  'google': 'Search',
  'graduation-cap': 'GraduationCap', // fallback to Award
  'group': 'Users',
  'h-square': 'Heart', // closest
  'hand-grab-o': 'Hand',
  'hand-lizard-o': 'Hand',
  'hand-o-down': 'Pointer',
  'hand-o-left': 'Pointer',
  'hand-o-right': 'Pointer',
  'hand-o-up': 'Pointer',
  'hand-paper-o': 'Hand',
  'hand-peace-o': 'Hand',
  'hand-pointer-o': 'Pointer',
  'hand-rock-o': 'Hand',
  'hand-scissors-o': 'Scissors',
  'hand-spock-o': 'Hand',
  'handshake-o': 'Handshake',
  'hashtag': 'Hash', // fallback
  'hdd-o': 'HardDrive',
  'header': 'Heading',
  'headphones': 'Headphones',
  'heart': 'Heart',
  'heart-o': 'Heart',
  'heartbeat': 'HeartPulse',
  'history': 'History',
  'home': 'Home',
  'hospital-o': 'Hospital',
  'hotel': 'Hotel',
  'hourglass': 'Hourglass',
  'hourglass-end': 'Hourglass',
  'hourglass-half': 'Hourglass',
  'hourglass-o': 'Hourglass',
  'hourglass-start': 'Hourglass',
  'html5': 'Code',
  'id-badge': 'BadgeCheck',
  'id-card': 'CreditCard',
  'id-card-o': 'CreditCard',
  'image': 'Image',
  'inr': 'IndianRupee',
  'indent': 'IndentIncrease',
  'industry': 'Factory',
  'info': 'Info',
  'info-circle': 'Info',
  'inr': 'IndianRupee',
  'instagram': 'Instagram',
  'institution': 'University',
  'italic': 'Italic',
  'jpy': 'JapaneseYen',
  'jsfiddle': 'Code', // fallback
  'key': 'Key',
  'keyboard-o': 'Keyboard',
  'krw': 'KoreanWon',
  'laptop': 'Laptop',
  'leaf': 'Leaf',
  'leanpub': 'Book', // fallback
  'legal': 'Scale',
  'lemon-o': 'Lemon',
  'level-down': 'ArrowDown',
  'level-up': 'ArrowUp',
  'life-bouy': 'LifeBuoy', // Lucide LifeBuoy
  'life-buoy': 'LifeBuoy',
  'life-ring': 'LifeBuoy',
  'life-saver': 'LifeBuoy',
  'lightbulb-o': 'Lightbulb',
  'line-chart': 'LineChart',
  'link': 'Link',
  'linkedin': 'Linkedin',
  'linux': 'Terminal',
  'list': 'List',
  'list-alt': 'ListOrdered',
  'list-ol': 'ListOrdered',
  'list-ul': 'List',
  'location-arrow': 'Navigation',
  'lock': 'Lock',
  'long-arrow-down': 'ArrowDown',
  'long-arrow-left': 'ArrowLeft',
  'long-arrow-right': 'ArrowRight',
  'long-arrow-up': 'ArrowUp',
  'low-vision': 'EyeOff',
  'magic': 'Wand2',
  'magnet': 'Magnet', // fallback to HelpCircle
  'mail-forward': 'Share2',
  'mail-reply': 'Reply',
  'mail-reply-all': 'ReplyAll',
  'male': 'User',
  'map': 'Map',
  'map-marker': 'MapPin',
  'map-o': 'Map',
  'map-pin': 'MapPin',
  'map-signs': 'Signpost',
  'mars': 'User', // closest
  'maxcdn': 'Gauge',
  'meanpath': 'HelpCircle',
  'medkit': 'HelpCircle',
  'meh-o': 'Meh', // Lucide Meh
  'microchip': 'Cpu',
  'microphone': 'Mic',
  'microphone-slash': 'MicOff',
  'minus': 'Minus',
  'minus-circle': 'MinusCircle',
  'minus-square': 'MinusSquare',
  'minus-square-o': 'MinusSquare',
  'mobile': 'Smartphone',
  'mobile-phone': 'Smartphone',
  'money': 'Banknote',
  'moon-o': 'Moon',
  'motorcycle': 'Bike',
  'mouse-pointer': 'MousePointer',
  'music': 'Music',
  'navicon': 'Menu',
  'newspaper-o': 'Newspaper',
  'object-group': 'Group',
  'object-ungroup': 'Ungroup',
  'outdent': 'IndentDecrease',
  'paint-brush': 'Paintbrush',
  'paper-plane': 'Send',
  'paper-plane-o': 'Send',
  'paperclip': 'Paperclip',
  'paragraph': 'Paragraph',
  'paste': 'Clipboard',
  'pause': 'Pause',
  'pause-circle': 'PauseCircle',
  'pause-circle-o': 'PauseCircle',
  'paw': 'Paw', // fallback to Heart
  'paypal': 'CreditCard', // closest
  'pencil': 'Edit2',
  'pencil-square': 'FileEdit',
  'pencil-square-o': 'Edit',
  'percent': 'Percent',
  'phone': 'Phone',
  'phone-square': 'Phone',
  'photo': 'Image',
  'picture-o': 'Image',
  'pie-chart': 'PieChart',
  'pinterest': 'HelpCircle',
  'plane': 'Plane',
  'play': 'Play',
  'play-circle': 'PlayCircle',
  'play-circle-o': 'PlayCircle',
  'plug': 'Plug',
  'plus': 'Plus',
  'plus-circle': 'PlusCircle',
  'plus-square': 'PlusSquare',
  'plus-square-o': 'PlusSquare',
  'power-off': 'Power',
  'print': 'Printer',
  'puzzle-piece': 'Puzzle',
  'qrcode': 'QrCode',
  'question': 'HelpCircle',
  'question-circle': 'HelpCircle',
  'question-circle-o': 'HelpCircle',
  'quote-left': 'Quote', // fallback
  'quote-right': 'Quote', // fallback
  'random': 'Shuffle', // Lucide Shuffle
  'receipt': 'Receipt',
  'recycle': 'Recycle',
  'reddit': 'HelpCircle',
  'refresh': 'RefreshCw',
  'remove': 'X',
  'reorder': 'Menu',
  'repeat': 'Repeat2', // intentional override
  'reply': 'Reply',
  'reply-all': 'ReplyAll',
  'retweet': 'Repeat2',
  'ribbon': 'Award', // closest
  'rocket': 'Rocket',
  'rotate-left': 'RotateCcw',
  'rotate-right': 'RotateCw',
  'rouble': 'RussianRuble',
  'rss': 'Rss',
  'rss-square': 'Rss',
  'rub': 'RussianRuble',
  'ruble': 'RussianRuble',
  'rupee': 'IndianRupee',
  'save': 'Save',
  'scissors': 'Scissors',
  'search': 'Search',
  'send': 'Send',
  'send-o': 'Send',
  'server': 'Server',
  'share': 'Share2',
  'share-alt': 'Share',
  'share-square': 'Share2',
  'share-square-o': 'Share2',
  'shield': 'Shield',
  'ship': 'Ship',
  'shopping-bag': 'ShoppingBag',
  'shopping-basket': 'ShoppingBasket',
  'shopping-cart': 'ShoppingCart',
  'shuffle': 'Shuffle',
  'sign-in': 'LogIn',
  'sign-language': 'Hand',
  'sign-out': 'LogOut',
  'signal': 'Signal',
  'signing': 'Hand',
  'sitemap': 'Network',
  'skype': 'Phone', // closest
  'slack': 'Hash', // fallback
  'sliders': 'SlidersHorizontal',
  'smile-o': 'Smile', // Lucide Smile
  'snapchat': 'HelpCircle',
  'snowflake-o': 'Snowflake',
  'sort': 'ArrowUpDown',
  'sort-alpha-asc': 'ArrowDownAZ',
  'sort-alpha-desc': 'ArrowUpZA',
  'sort-asc': 'ArrowUp',
  'sort-desc': 'ArrowDown',
  'sort-down': 'ArrowDown',
  'sort-numeric-asc': 'ArrowDown01',
  'sort-numeric-desc': 'ArrowUp01',
  'sort-up': 'ArrowUp',
  'soundcloud': 'Music', // fallback
  'spoon': 'Utensils',
  'spotify': 'Music', // fallback
  'square': 'Square',
  'square-o': 'Square',
  'stack-exchange': 'HelpCircle',
  'stack-overflow': 'HelpCircle',
  'star': 'Star',
  'star-half': 'StarHalf',
  'star-half-o': 'StarHalf',
  'star-o': 'Star',
  'step-backward': 'SkipBack',
  'step-forward': 'SkipForward',
  'sticky-note': 'StickyNote',
  'sticky-note-o': 'StickyNote',
  'stop': 'Square',
  'stop-circle': 'StopCircle',
  'stop-circle-o': 'StopCircle',
  'street-view': 'ScanEye',
  'strikethrough': 'Strikethrough',
  'stumbleupon': 'HelpCircle',
  'subscript': 'Subscript',
  'subway': 'Train',
  'suitcase': 'Briefcase',
  'sun-o': 'Sun',
  'superscript': 'Superscript',
  'table': 'Table',
  'tablet': 'Tablet',
  'tachometer': 'Gauge',
  'tag': 'Tag',
  'tags': 'Tags',
  'tasks': 'ListTodo',
  'taxi': 'Car',
  'television': 'Tv', // Lucide Tv
  'terminal': 'Terminal',
  'text-height': 'MoveVertical',
  'text-width': 'MoveHorizontal',
  'th': 'LayoutGrid',
  'th-large': 'LayoutGrid',
  'th-list': 'List',
  'thermometer': 'Thermometer',
  'thermometer-empty': 'Thermometer',
  'thermometer-full': 'Thermometer',
  'thermometer-half': 'Thermometer',
  'thermometer-quarter': 'Thermometer',
  'thermometer-three-quarters': 'Thermometer',
  'thumb-tack': 'Pin',
  'thumbs-down': 'ThumbsDown',
  'thumbs-o-down': 'ThumbsDown',
  'thumbs-o-up': 'ThumbsUp',
  'thumbs-up': 'ThumbsUp',
  'ticket': 'Ticket', // Lucide Ticket
  'times': 'X',
  'times-circle': 'XCircle',
  'times-circle-o': 'XCircle',
  'tint': 'Droplets',
  'toggle-off': 'ChevronLeft',
  'toggle-on': 'ChevronRight',
  'trademark': 'Trademark', // fallback to HelpCircle
  'train': 'Train',
  'trash': 'Trash2',
  'trash-o': 'Trash2',
  'tree': 'Tree',
  'trello': 'Trello',
  'trophy': 'Trophy',
  'truck': 'Truck',
  'tv': 'Tv',
  'twitch': 'Video', // closest
  'twitter': 'Twitter',
  'umbrella': 'Umbrella',
  'underline': 'Underline',
  'undo': 'Undo',
  'ungroup': 'Ungroup',
  'university': 'University',
  'unlink': 'Unlink',
  'unlock': 'Unlock',
  'unlock-alt': 'Unlock',
  'unsorted': 'ArrowUpDown',
  'upload': 'Upload',
  'usb': 'Usb',
  'usd': 'DollarSign',
  'user': 'User',
  'user-circle': 'UserCircle',
  'user-circle-o': 'UserCircle',
  'user-md': 'Stethoscope',
  'user-o': 'User',
  'user-plus': 'UserPlus',
  'user-secret': 'UserX',
  'user-times': 'UserMinus',
  'users': 'Users',
  'venus': 'User', // closest
  'video-camera': 'Video',
  'vimeo': 'Video', // fallback
  'volume-down': 'Volume1',
  'volume-off': 'VolumeX',
  'volume-up': 'Volume2',
  'wallet': 'Wallet',
  'warning': 'AlertTriangle',
  'wechat': 'MessageCircle', // closest
  'weibo': 'Share2', // closest
  'whatsapp': 'MessageCircle', // closest
  'wheelchair': 'Accessibility',
  'wifi': 'Wifi',
  'wikipedia-w': 'Book', // fallback
  'window-close': 'X',
  'window-close-o': 'X',
  'window-maximize': 'Maximize2',
  'window-minimize': 'Minus',
  'window-restore': 'Copy',
  'windows': 'Monitor',
  'won': 'KoreanWon',
  'wordpress': 'HelpCircle',
  'wrench': 'Wrench',
  'xing': 'HelpCircle',
  'yahoo': 'Search', // fallback
  'yen': 'JapaneseYen',
  'youtube': 'Youtube',
  'youtube-play': 'Play',
};

// ============================================================
// Lookup Helper
// ============================================================

/**
 * Looks up a Font Awesome icon name in the mapping and returns the
 * corresponding Lucide icon name.
 *
 * @param faName - The Font Awesome icon name, with or without the `fa-` prefix.
 *                 Examples: `"search"`, `"fa-search"`, `"fa fa-search"`
 * @returns The Lucide icon name, or `null` if no mapping is found.
 */
export function getLucideIcon(faName: string): LucideIconName | null {
  if (!faName) return null;

  // Strip common FA class patterns: "fa fa-search", "fas fa-search", "far fa-search", "fa-search"
  let normalized = faName.trim();

  // Remove FA prefix patterns like "fa ", "fas ", "far ", "fab ", "fal "
  normalized = normalized.replace(/^(fa[slrb]?\s+)+/i, '');

  // Remove leading "fa-" prefix
  if (normalized.startsWith('fa-')) {
    normalized = normalized.slice(3);
  }

  // Look up in the map
  const result = faToLucideMap[normalized];
  if (result) return result;

  // Try converting underscores to hyphens (some FA names use underscores)
  const underscoreVariant = normalized.replace(/_/g, '-');
  if (underscoreVariant !== normalized) {
    const altResult = faToLucideMap[underscoreVariant];
    if (altResult) return altResult;
  }

  return null;
}
