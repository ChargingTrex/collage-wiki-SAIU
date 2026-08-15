// src/data/clubDirectory.js
//
// One entry per club for the /clubs directory grid: which Hero component to
// render (mini, via MiniHeroCard) and the display name/doc route. Keep in
// slug order matching CLAUDE.md's club table.

import {AnimalWelfareHero} from '@site/src/components/clubs/AnimalWelfareHero';
import {ArtHero} from '@site/src/components/clubs/ArtHero';
import {AstronomyHero} from '@site/src/components/clubs/AstronomyHero';
import {ChessHero} from '@site/src/components/clubs/ChessHero';
import {DanceHero} from '@site/src/components/clubs/DanceHero';
import {EntrepreneurshipHero} from '@site/src/components/clubs/EntrepreneurshipHero';
import {FashionHero} from '@site/src/components/clubs/FashionHero';
import {FilmSocietyHero} from '@site/src/components/clubs/FilmSocietyHero';
import {FossHero} from '@site/src/components/clubs/FossHero';
import {GamingHero} from '@site/src/components/clubs/GamingHero';
import {GardeningHero} from '@site/src/components/clubs/GardeningHero';
import {LiteraryHero} from '@site/src/components/clubs/LiteraryHero';
import {MartialArtsHero} from '@site/src/components/clubs/MartialArtsHero';
import {MusicHero} from '@site/src/components/clubs/MusicHero';
import {OratoryHero} from '@site/src/components/clubs/OratoryHero';
import {PhotographyHero} from '@site/src/components/clubs/PhotographyHero';
import {PugwashHero} from '@site/src/components/clubs/PugwashHero';
import {ScienceHero} from '@site/src/components/clubs/ScienceHero';
import {SportsHero} from '@site/src/components/clubs/SportsHero';
import {TheatreHero} from '@site/src/components/clubs/TheatreHero';
import {TuringitesHero} from '@site/src/components/clubs/TuringitesHero';

export const CLUB_DIRECTORY = [
  {slug: 'literary-club', name: 'Literary Club', Hero: LiteraryHero},
  {slug: 'art-club', name: 'Art Club', Hero: ArtHero},
  {slug: 'dance-club', name: 'Dance Club', Hero: DanceHero},
  {slug: 'gardening-club', name: 'Gardening Club', Hero: GardeningHero},
  {slug: 'astronomy-club', name: 'Astronomy Club', Hero: AstronomyHero},
  {slug: 'theatre-club', name: 'Theatre Club', Hero: TheatreHero},
  {slug: 'photography-club', name: 'Photography Club', Hero: PhotographyHero},
  {slug: 'gaming-club', name: 'Gaming Club', Hero: GamingHero},
  {slug: 'oratory-club', name: 'Oratory Club', Hero: OratoryHero},
  {slug: 'entrepreneurship-club', name: 'Entrepreneurship Club', Hero: EntrepreneurshipHero},
  {slug: 'fashion-club', name: 'Fashion Club', Hero: FashionHero},
  {slug: 'science-society', name: 'Science Society', Hero: ScienceHero},
  {slug: 'music-club', name: 'Music Club', Hero: MusicHero},
  {slug: 'film-society', name: 'Film Society', Hero: FilmSocietyHero},
  {slug: 'turingites-computer-science-society', name: 'Turingites CS Society', Hero: TuringitesHero},
  {slug: 'animal-welfare-society', name: 'Animal Welfare Society', Hero: AnimalWelfareHero},
  {slug: 'martial-arts-club', name: 'Martial Arts Club', Hero: MartialArtsHero},
  {slug: 'foss-club', name: 'FOSS Club', Hero: FossHero},
  {slug: 'chess-club', name: 'Chess Club', Hero: ChessHero},
  {slug: 'pugwash-society', name: 'Pugwash Society', Hero: PugwashHero},
  {slug: 'sports-society', name: 'Sports Society', Hero: SportsHero},
];
