CREATE TABLE `visited_data` (
  `user` int(11) NOT NULL,
  `country` varchar(50) NOT NULL,
  `year` int(11) NOT NULL,
  `comment` text NOT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=COMPACT;

